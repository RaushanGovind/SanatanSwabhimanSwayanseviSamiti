from fastapi import APIRouter, Depends, HTTPException, Body, File, UploadFile
import os
import shutil
import uuid
from typing import List, Optional
from database import assistance_requests_collection, contributions_collection, notices_collection, users_collection, families_collection, inquiries_collection, db
from models.schemas import (
    AssistanceCreate, AssistanceResponse,
    ContributionCreate, ContributionResponse,
    NoticeCreate, NoticeResponse
)
import datetime
from dependencies import get_current_user, get_admin_user, get_secretary_user, get_treasurer_user, get_committee_user
from utils.audit import log_action
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

# --- UTILS ---
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = f"uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/uploads/{filename}", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")

# --- ASSISTANCE REQUESTS ---

@router.post("/assistance", response_model=AssistanceResponse)
async def create_assistance_request(
    request: AssistanceCreate, 
    current_user: dict = Depends(get_current_user)
):
    # Check if Coordinator/Committee requesting on behalf of someone
    is_privileged = current_user.get("role") in ["admin", "super_admin", "coordinator"] or current_user.get("position") in ["coordinator", "president", "secretary", "treasurer"]
    
    # 1. Determine Target Family
    target_family_id = None
    
    if is_privileged and request.request_on_behalf_of:
        # Resolve family by ID or Unique ID
        fam = await families_collection.find_one({
            "$or": [
                {"_id": ObjectId(request.request_on_behalf_of) if ObjectId.is_valid(request.request_on_behalf_of) else None},
                {"family_id": request.request_on_behalf_of}
            ]
        })
        if not fam:
             raise HTTPException(status_code=404, detail="Target family (on behalf of) not found")
        target_family_id = str(fam.get("_id"))
    else:
        # Standard: User requesting for themselves
        target_family_id = current_user.get("family_id")
        if not target_family_id:
            # Fallback: try to find family if they are head
            fam = await families_collection.find_one({"user_id": current_user.get("id")})
            if fam:
                target_family_id = str(fam.get("_id"))
            else:
                raise HTTPException(status_code=400, detail="User not linked to a family")
            
    db_request = {
        "family_id": target_family_id,
        "request_type": request.request_type,
        "amount_requested": request.amount_requested,
        "description": request.description,
        "status": "Pending",
        "created_at": datetime.datetime.utcnow(),
        "requester_id": current_user.get("id"),
        "requester_role": current_user.get("role"),
        "request_on_behalf_of": request.request_on_behalf_of if (is_privileged and request.request_on_behalf_of) else None,
        "attachments": request.attachments
    }
    result = await assistance_requests_collection.insert_one(db_request)
    db_request["_id"] = result.inserted_id
    return db_request

@router.get("/assistance", response_model=List[AssistanceResponse])
async def get_assistance_requests(
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    committee_positions = ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'joint_treasurer', 'executive_member', 'coordinator']
    is_committee = role in ["admin", "super_admin"] or current_user.get("position") in committee_positions
    if is_committee:
        cursor = assistance_requests_collection.find()
    else:
        family_id = current_user.get("family_id")
        if not family_id:
             fam = await families_collection.find_one({"user_id": current_user.get("id")})
             if fam: family_id = str(fam.get("_id"))
             
        if not family_id:
            return []
        
        cursor = assistance_requests_collection.find({"family_id": family_id})
    
    return await cursor.to_list(length=1000)

@router.put("/assistance/{request_id}/status", response_model=AssistanceResponse)
async def update_assistance_status(
    request_id: str,
    status: str = Body(..., embed=True),
    current_user: dict = Depends(get_secretary_user)
):
    req = await assistance_requests_collection.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    old_status = req.get("status")
    await assistance_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": status}}
    )
    
    # Audit log
    await log_action(current_user.get("id"), "UPDATE_STATUS", "AssistanceRequest", request_id, {
        "old_status": old_status,
        "new_status": status
    })
    
    updated_req = await assistance_requests_collection.find_one({"_id": ObjectId(request_id)})
    return updated_req

# --- CONTRIBUTIONS ---

@router.get("/contributions", response_model=List[ContributionResponse])
async def get_contributions(
    current_user: dict = Depends(get_current_user)
):
    role = current_user.get("role")
    committee_positions = ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'joint_treasurer', 'executive_member', 'coordinator']
    is_committee = role in ["admin", "super_admin"] or current_user.get("position") in committee_positions
    if is_committee:
        cursor = contributions_collection.find()
    else:
        family_id = current_user.get("family_id")
        if not family_id:
             fam = await families_collection.find_one({"user_id": current_user.get("id")})
             if fam: family_id = str(fam.get("_id"))
             
        if not family_id:
            return []
        cursor = contributions_collection.find({"family_id": family_id})
        
    return await cursor.to_list(length=1000)

@router.post("/contributions", response_model=ContributionResponse)
async def record_contribution(
    contribution: ContributionCreate,
    family_id: str,
    current_user: dict = Depends(get_treasurer_user)
):
    db_contrib = {
        "family_id": family_id,
        "amount": contribution.amount,
        "payment_type": contribution.payment_type,
        "status": "Completed",
        "payment_date": datetime.datetime.utcnow()
    }
    result = await contributions_collection.insert_one(db_contrib)
    db_contrib["_id"] = result.inserted_id
    
    # Audit log
    await log_action(current_user.get("id"), "CREATE", "Contribution", str(result.inserted_id), {
        "family_id": family_id,
        "amount": contribution.amount,
        "type": contribution.payment_type
    })
    
    return db_contrib

from dependencies import get_current_user, get_admin_user, get_secretary_user, get_treasurer_user, get_committee_user, get_current_user_optional

# --- NOTICES ---

@router.get("/notices", response_model=List[NoticeResponse])
async def get_notices(
    filter_type: Optional[str] = None, # all, global, committee, or specific role
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    query = {}
    now = datetime.datetime.utcnow()
    
    # Determine if user is a Manager (Admin/Super Admin)
    is_manager = False
    if current_user:
        if current_user.get("role") in ['admin', 'super_admin']:
            is_manager = True

    # Calculate allowed audiences
    allowed_audiences = ["all"]
    if current_user:
        u_role = current_user.get("role")
        if u_role == "family_head": 
            allowed_audiences.extend(["family_head", "family_member"])
        elif u_role == "member": 
            allowed_audiences.append("family_member")
        
        u_pos = current_user.get("position")
        committee_positions = ['president', 'vice_president', 'secretary', 'treasurer', 'executive_member', 'coordinator']
        if u_pos in committee_positions or u_role in committee_positions:
            allowed_audiences.append("committee")
            if u_pos and u_pos != 'none': allowed_audiences.append(u_pos)
            if u_role in committee_positions: allowed_audiences.append(u_role)

    if not is_manager:
        query["is_active"] = True
        query["$or"] = [{"scheduled_at": None}, {"scheduled_at": {"$lte": now}}]
        
        # Base constraint: Must be in allowed audiences
        target_audiences = allowed_audiences
        
        # If frontend applies a filter, it must be a subset of allowed audiences
        if filter_type and filter_type != 'all':
            if filter_type == 'global':
                requested = ["all", "family_head", "family_member"]
            elif filter_type == 'committee':
                requested = ['committee', 'president', 'vice_president', 'secretary', 'treasurer', 'executive_member', 'coordinator']
            else:
                requested = [filter_type]
            
            # Intersection: User can only filter for what they are already allowed to see
            target_audiences = [a for a in requested if a in allowed_audiences]
        
        query["visible_to"] = {"$in": target_audiences}
    else:
        # Managers see everything, but can still use filters to narrow down view
        if filter_type and filter_type != 'all':
            if filter_type == 'global':
                query["visible_to"] = {"$in": ["all", "family_head", "family_member"]}
            elif filter_type == 'committee':
                query["visible_to"] = {"$in": ['committee', 'president', 'vice_president', 'secretary', 'treasurer', 'executive_member', 'coordinator']}
            else:
                query["visible_to"] = filter_type

    cursor = notices_collection.find(query).sort("created_at", -1)
    return await cursor.to_list(length=100)

@router.post("/notices", response_model=NoticeResponse)
async def create_notice(
    notice: NoticeCreate,
    current_user: dict = Depends(get_committee_user)
):
    db_notice = {
        "title": notice.title,
        "content": notice.content,
        "category": notice.category,
        "priority": notice.priority,
        "type": notice.type,
        "icon": notice.icon,
        "visible_to": notice.visible_to,
        "is_active": notice.is_active,
        "scheduled_at": notice.scheduled_at,
        "created_at": datetime.datetime.utcnow(),
        "created_by_name": current_user.get("name"),
        "created_by_id": current_user.get("id")
    }
    result = await notices_collection.insert_one(db_notice)
    db_notice["_id"] = result.inserted_id
    
    # Audit log
    await log_action(current_user.get("id"), "CREATE", "Notice", str(result.inserted_id), {
        "title": notice.title,
        "category": notice.category
    })
    
    return db_notice

@router.put("/notices/{notice_id}", response_model=NoticeResponse)
async def update_notice(
    notice_id: str,
    notice: NoticeCreate,
    current_user: dict = Depends(get_committee_user)
):
    existing = await notices_collection.find_one({"_id": ObjectId(notice_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    update_data = notice.dict()
    update_data["updated_at"] = datetime.datetime.utcnow()
    
    await notices_collection.update_one(
        {"_id": ObjectId(notice_id)},
        {"$set": update_data}
    )
    
    # Audit log
    await log_action(current_user.get("id"), "UPDATE", "Notice", notice_id, {"title": notice.title})
    
    updated = await notices_collection.find_one({"_id": ObjectId(notice_id)})
    return updated

@router.delete("/notices/{notice_id}")
async def delete_notice(
    notice_id: str,
    current_user: dict = Depends(get_committee_user)
):
    res = await notices_collection.delete_one({"_id": ObjectId(notice_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    await log_action(current_user.get("id"), "DELETE", "Notice", notice_id, {})
    return {"message": "Notice deleted successfuly"}

# --- INQUIRIES ---

class InquiryCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str

@router.post("/inquiry")
async def create_inquiry(inquiry: InquiryCreate):
    db_inquiry = {
        "name": inquiry.name,
        "email": inquiry.email,
        "phone": inquiry.phone,
        "message": inquiry.message,
        "timestamp": datetime.datetime.utcnow()
    }
    await inquiries_collection.insert_one(db_inquiry)
    return {"message": "Inquiry received. We will contact you soon."}

@router.get("/inquiries", response_model=List[dict])
async def get_inquiries(current_user: dict = Depends(get_committee_user)):
    cursor = inquiries_collection.find().sort("timestamp", -1)
    inquiries = await cursor.to_list(length=100)
    result = []
    for i in inquiries:
        result.append({
            "id": str(i.get("_id")),
            "name": i.get("name"),
            "email": i.get("email"),
            "phone": i.get("phone"),
            "message": i.get("message"),
            "time": i.get("timestamp").strftime("%Y-%m-%d %H:%M") if i.get("timestamp") else "N/A"
        })
    return result

# --- METADATA ---

@router.get("/metadata/options")
async def get_form_options():
    collection = db.get_collection("form_options")
    cursor = collection.find({}, {"_id": 0})
    options = await cursor.to_list(length=100)
    # Convert to a more frontend-friendly format: { category: [options] }
    result = {}
    for item in options:
        result[item["category"]] = item["options"]
    return result
