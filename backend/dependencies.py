from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from database import users_collection
from utils.security import SECRET_KEY, ALGORITHM
from bson import ObjectId

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional)):
    if not token:
        return None
    try:
        return await get_current_user(token)
    except:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
    except:
        # Fallback if user_id is not a valid ObjectId (maybe it was an int in SQLite)
        user = await users_collection.find_one({"id": user_id})
        
    if user is None:
        raise credentials_exception
    
    # Add a string version of _id for convenience
    user["id"] = str(user["_id"])
    return user

async def get_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_committee_user(current_user: dict = Depends(get_active_user)):
    committee_roles = ['admin', 'super_admin', 'president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'joint_treasurer', 'executive_member', 'coordinator']
    role = current_user.get("role", "").lower()
    position = current_user.get("position", "").lower()
    
    if role in committee_roles or position in committee_roles:
        return current_user
        
    print(f"AUTH DEBUG: Denied committee access to {current_user.get('name')} | role: {role} | position: {position}")
    raise HTTPException(status_code=403, detail=f"Only committee members can access this. Your role: {role}, Pos: {position}")

async def get_admin_user(current_user: dict = Depends(get_committee_user)):
    return current_user

async def get_treasurer_user(current_user: dict = Depends(get_active_user)):
    role = current_user.get("role", "").lower()
    position = current_user.get("position", "").lower()
    if role in ['super_admin', 'admin'] or position in ['president', 'treasurer', 'joint_treasurer']:
        return current_user
    raise HTTPException(status_code=403, detail="Finance operations restricted to Treasurer/President")

async def get_secretary_user(current_user: dict = Depends(get_active_user)):
    role = current_user.get("role", "").lower()
    position = current_user.get("position", "").lower()
    if role in ['super_admin', 'admin'] or position in ['president', 'secretary', 'joint_secretary']:
        return current_user
    raise HTTPException(status_code=403, detail="Administrative operations restricted to Secretary/President")

async def get_president_user(current_user: dict = Depends(get_active_user)):
    role = current_user.get("role", "").lower()
    position = current_user.get("position", "").lower()
    if role in ['super_admin', 'admin'] or position in ['president', 'vice_president']:
        return current_user
    raise HTTPException(status_code=403, detail="Only President can approve this")
    return current_user
