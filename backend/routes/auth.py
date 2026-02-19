from fastapi import APIRouter, HTTPException, status, Depends, Body, File, UploadFile
from models.schemas import UserCreate, Token
from database import users_collection, families_collection
from utils.security import get_password_hash, verify_password, create_access_token
from dependencies import get_current_user
import json
import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role,
        "position": "none",
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.datetime.utcnow()
    }
    
    result = await users_collection.insert_one(new_user)
    return {"id": str(result.inserted_id), "message": "User registered successfully"}

@router.post("/signup", response_model=dict)
async def signup(user: UserCreate):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = get_password_hash(user.password)
    
    # 1. Create User
    new_user = {
        "name": user.name,
        "phone": user.phone,
        "role": "family_head",
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.datetime.utcnow()
    }
    ur = await users_collection.insert_one(new_user)
    user_id = str(ur.inserted_id)
    
    # 2. Create Skeleton Family Record
    # Check for recommendation details
    rec_details = {}
    if user.recommendation_token:
        try:
             # Need to import recommendations_collection if used here, usually it's in database.py
             from database import recommendations_collection
             rec = await recommendations_collection.find_one({"token": user.recommendation_token})
             if rec:
                rec_details = {
                    "head_details": {
                        "full_name": rec.get("new_head_name"),
                        "father_name": rec.get("father_name"),
                        "mobile": rec.get("mobile"),
                        "email": rec.get("email")
                    },
                    "join_method": "Recommendation",
                    "recommender_id": rec.get("recommender_id"),
                    "recommender_name": rec.get("recommender_name")
                }
        except:
            pass

    new_family = {
        "user_id": user_id,
        "head_name": user.name,
        "status": "Profile Incomplete",
        "verification_stage": "Not Submitted",
        "created_at": datetime.datetime.utcnow(),
        "form_data": json.dumps(rec_details) if rec_details else None
    }
    if rec_details:
        new_family["recommender_id"] = rec_details.get("recommender_id")

    await families_collection.insert_one(new_family)
    
    return {"message": "Signup successful! You can now login and complete your profile."}

@router.post("/login", response_model=Token)
async def login(credentials: dict):
    identifier = credentials.get('phone') # Accepts Phone OR Member ID
    password = credentials.get('password')
    requested_role = credentials.get('role') # User selected role
    
    # 1. Try to find User by Phone or Email (Normal Login)
    user = None
    # Always check users table first, even for family_member requests
    user = await users_collection.find_one({"$or": [{"phone": identifier}, {"email": identifier}]})
    
    if user:
        # Check if the user's actual role/position matches the requested role
        COMMITTEE_POSITIONS = ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'auditor', 'pro', 'coordinator']
        
        user_role = user.get("role", "").lower()
        user_position = user.get("position", "none").lower()
        
        # Special case: Allow family_head to login via Member tab (they're members of their own family)
        if requested_role == 'family_member' and user_role == 'family_head':
            # Allow family heads to view as members
            if not verify_password(password, user.get("hashed_password")):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
            
            user_id_str = str(user.get("_id"))
            access_token = create_access_token(data={"sub": user_id_str, "role": "family_member", "position": "none"})
            user_response = { 
                "name": user.get("name"), 
                "phone": user.get("phone"),
                "email": user.get("email"),
                "role": "family_member",  # Return as family_member for member dashboard
                "position": "none",
                "id": user_id_str 
            }
            return {"access_token": access_token, "token_type": "bearer", "user": user_response}
        
        if requested_role and user_role != requested_role:
             is_committee_post = (user_position in COMMITTEE_POSITIONS) or (user_role in COMMITTEE_POSITIONS)
             is_requested_committee = requested_role in COMMITTEE_POSITIONS or requested_role == 'admin'
             
             # Allow if user has a committee post and is trying to login via committee portal
             if not (is_committee_post and is_requested_committee):
                  # Fallback: check if they are just an admin role
                  if not (user_role in ['admin', 'super_admin'] and is_requested_committee):
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Account role is {user_role}, cannot login as {requested_role}")

        # Standard User Login
        if not verify_password(password, user.get("hashed_password")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        user_id_str = str(user.get("_id"))
        
        # Determine Effective Role for this Session
        # If requested_role was validated above (or matched), use it. Otherwise default to DB role.
        # Logic: If I requested 'president' and passed the checks, I am logging in AS president.
        # If I requested 'family_head' (implied by default or explicit), I am logging in AS family_head.
        effective_role = requested_role if requested_role and requested_role != 'family_member' else user_role
        
        # Include effective role in token
        access_token = create_access_token(data={"sub": user_id_str, "role": effective_role, "position": user_position})
        user_response = { 
            "name": user.get("name"), 
            "phone": user.get("phone"),
            "email": user.get("email"),
            "role": effective_role, 
            "position": user_position,
            "id": user_id_str 
        }
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}


    # 2. If not a generic user, check if it's a Member ID (Pattern: F-xxxx-Mxx) or Member Mobile
    if requested_role == 'family_member' or (identifier and "F-" in identifier):
        member_data = None
        family_head_user = None
        
        # Check if identifier is a phone number (10 digits) or Member ID
        is_phone = identifier and identifier.isdigit() and len(identifier) == 10
        
        cursor = families_collection.find({"status": "Approved"})
        async for fam in cursor:
            try:
                form_data = fam.get("form_data")
                data = json.loads(form_data) if isinstance(form_data, str) else form_data
                members = data.get('members', [])
                for mem in members:
                    # Match by Member ID or Mobile Number
                    if is_phone:
                        if mem.get('mobile') == identifier:
                            member_data = mem
                            family_head_user = await users_collection.find_one({"_id": ObjectId(fam.get("user_id"))})
                            break
                    else:
                        if mem.get('member_id') == identifier:
                            member_data = mem
                            family_head_user = await users_collection.find_one({"_id": ObjectId(fam.get("user_id"))})
                            break
                if member_data: break
            except: continue

        if member_data and family_head_user:
            if not verify_password(password, family_head_user.get("hashed_password")):
                 raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Family Password")
            
            access_token = create_access_token(data={
                "sub": str(family_head_user.get("_id")), 
                "role": "family_member",
                "member_id": member_data.get('member_id'),
                "member_name": member_data.get('full_name')
            })
            
            user_response = {
                "name": member_data.get('full_name'),
                "role": "family_member",
                "position": "none",
                "id": member_data.get('member_id'),
                "phone": member_data.get('mobile'),
                "family_head_id": str(family_head_user.get("_id"))
            }
            return {"access_token": access_token, "token_type": "bearer", "user": user_response}


    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials or Role mismatch")



class PasswordChangeModel(BaseModel):
    old_password: str
    new_password: str

class ProfileUpdateModel(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

@router.post("/change-password")
async def change_password(
    data: PasswordChangeModel,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not verify_password(data.old_password, user.get("hashed_password")):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    new_hashed = get_password_hash(data.new_password)
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": new_hashed}}
    )
    
    return {"message": "Password updated successfully"}

@router.post("/verify-password")
async def verify_password_endpoint(
    password_data: dict,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    password = password_data.get("password")
    if not password:
         raise HTTPException(status_code=400, detail="Password required")
         
    if not verify_password(password, user.get("hashed_password")):
         raise HTTPException(status_code=401, detail="Incorrect password")
         
    return {"message": "Password verified", "verified": True}

@router.post("/update-profile")
async def update_profile(
    data: ProfileUpdateModel,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    updates = {}
    if data.name: updates["name"] = data.name
    if data.email: updates["email"] = data.email
    
    if not updates:
        return {"message": "No changes provided"}
        
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updates}
    )
    
    return {"message": "Profile updated successfully", "updated_fields": updates}

@router.post("/update-photo")
async def update_photo(
    photo_url: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"profile_photo": photo_url}}
    )
    return {"message": "Photo updated", "url": photo_url}