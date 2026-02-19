from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional
import json
from pydantic import BaseModel
from datetime import datetime, timedelta
from database import (
    contributions_collection, assistance_requests_collection, families_collection, 
    users_collection, expenses_collection, audit_logs_collection,
    collection_campaigns_collection, contribution_proofs_collection
)
from models.schemas import (
    CollectionCampaignCreate, CollectionCampaignResponse,
    ContributionProofCreate, ContributionProofResponse
)
from dependencies import get_current_user, get_committee_user, get_treasurer_user, get_president_user
from utils.audit import log_action
from bson import ObjectId

router = APIRouter()

# Schema for Responses
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: str

class ExpenseSchema(BaseModel):
    id: str
    category: str
    amount: float
    description: str
    status: str
    date: str
    added_by_name: str
    approved_by_name: Optional[str] = None

class AccountOverview(BaseModel):
    opening_balance: float
    total_monthly_collection: float
    total_expenses: float
    closing_balance: float
    expense_breakdown: List[dict] # { "category": "Medical", "amount": 5000 }

class FinanceStats(BaseModel):
    total_collected: float
    current_balance: float
    total_assistance_given: float
    families_helped: int
    total_families: int
    total_members: int
    pending_expenses_count: int
    pending_help_requests_count: int
    monthly_data: List[dict]
    active_collections_breakdown: List[dict]
    monthly_help_beneficiaries: int

class ContributionSchema(BaseModel):
    id: str
    family_name: str
    amount: float
    date: str
    type: str

class BeneficiarySchema(BaseModel):
    id: str
    name: str # Family Head Name or Member Name
    type: str # Medical, Education, etc.
    amount: float
    date: str

@router.get("/stats", response_model=FinanceStats)
async def get_finance_stats():
    # 1. Total Collected
    pipeline_collected = [
        {"$match": {"status": "Completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    res_collected = await contributions_collection.aggregate(pipeline_collected).to_list(length=1)
    total_collected = res_collected[0]["total"] if res_collected else 0.0
    
    # 2. Total Assistance Given
    pipeline_given = [
        {"$match": {"status": "Approved"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount_requested"}}}
    ]
    res_given = await assistance_requests_collection.aggregate(pipeline_given).to_list(length=1)
    total_given = res_given[0]["total"] if res_given else 0.0
    
    # 3. Balance
    balance = total_collected - total_given
    
    # 4. Families Helped
    res_families = await assistance_requests_collection.distinct("family_id", {"status": "Approved"})
    families_helped = len(res_families)

    # 4.1 Monthly Help Beneficiaries (Recurring)
    # Assuming types like 'Monthly Support', 'Pension', 'Education' could be recurring
    rec_families = await assistance_requests_collection.distinct("family_id", {
        "status": "Approved", 
        "request_type": {"$in": ["Monthly Support", "Pension", "Education Support"]}
    })
    monthly_help_beneficiaries = len(rec_families)
    
    # 5. Monthly Data (Last 6 months)
    monthly_data = []
    pipeline_monthly = [
        {"$match": {"status": "Completed"}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m", "date": "$payment_date"}},
            "total": {"$sum": "$amount"}
        }},
        {"$sort": {"_id": 1}},
        {"$limit": 6}
    ]
    res_monthly = await contributions_collection.aggregate(pipeline_monthly).to_list(length=6)
    for rm in res_monthly:
        monthly_data.append({"month": rm["_id"], "collected": rm["total"]})
        
    if not monthly_data:
        monthly_data = [{"month": "2023-08", "collected": 0.0}]

    # 6. Current Month Active Collections
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    pipeline_active = [
        {"$match": {
            "status": "Completed",
            "payment_date": {"$gte": month_start}
        }},
        {"$group": {
            "_id": "$payment_type",
            "total": {"$sum": "$amount"}
        }}
    ]
    res_active = await contributions_collection.aggregate(pipeline_active).to_list(length=10)
    active_collections = [{"type": (doc["_id"] or "Other"), "amount": doc["total"]} for doc in res_active]
    
    if not active_collections:
        # Mock for display if empty
        active_collections = [
            {"type": "Monthly Contribution", "amount": 0.0},
            {"type": "Donation", "amount": 0.0}
        ]

    # 7. Pending Counts
    pending_expenses = await expenses_collection.count_documents({"status": "Pending"})
    pending_requests = await assistance_requests_collection.count_documents({"status": "Pending"})

    # 8. Registered Families & Members Count (Optimized)
    # We use aggregation to count members without fetching/parsing full documents
    pipeline_members = [
        {"$match": {"status": "Approved"}},
        {"$project": {
            "member_count": {
                "$cond": {
                    "if": {"$and": [
                        {"$ne": ["$form_data", None]},
                        {"$eq": [{"$type": "$form_data"}, "string"]}
                    ]},
                    # If it's a string, we still have a problem with MongoDB aggregation 
                    # unless we use $function or skip parsing.
                    # Actually, let's assume we can at least count the families 
                    # and if we can't aggregate nested JSON strings, we should at least
                    # projection-limit the fetch.
                    "then": 0, 
                    "else": {"$size": {"$ifNull": ["$members", []]}}
                }
            }
        }},
        {"$group": {
            "_id": None, 
            "total_families": {"$sum": 1},
            "total_members": {"$sum": {"$add": ["$member_count", 1]}} # +1 for Head
        }}
    ]
    
    # Actually, since form_data is a JSON string, MongoDB can't $size it.
    # We need a better way. If we can't change the schema right now, 
    # we should at least fetch ONLY the form_data field.
    
    res_stats = await families_collection.aggregate([
        {"$match": {"status": "Approved"}},
        {"$project": {"form_data": 1}},
    ]).to_list(length=10000)
    
    total_families = len(res_stats)
    total_members = 0
    for f in res_stats:
        total_members += 1
        data = f.get("form_data")
        if data:
            if isinstance(data, str):
                try:
                    # Quick check for member count in string to avoid full JSON parse if possible
                    # but for accuracy, we parse. It's still faster than fetching full docs.
                    parsed = json.loads(data)
                    total_members += len(parsed.get("members", []))
                except: pass
            elif isinstance(data, dict):
                total_members += len(data.get("members", []))

    return {
        "total_collected": total_collected,
        "current_balance": balance,
        "total_assistance_given": total_given,
        "families_helped": families_helped,
        "total_families": total_families,
        "total_members": total_members,
        "pending_expenses_count": pending_expenses,
        "pending_help_requests_count": pending_requests,
        "monthly_data": monthly_data,
        "active_collections_breakdown": active_collections,
        "monthly_help_beneficiaries": monthly_help_beneficiaries
    }

@router.get("/beneficiaries", response_model=List[BeneficiarySchema])
async def get_public_beneficiaries():
    """Returns a public list of APPROVED assistance requests for transparency."""
    cursor = assistance_requests_collection.find({"status": "Approved"}).sort("created_at", -1).limit(20)
    requests = await cursor.to_list(length=20)
    
    results = []
    for r in requests:
        # Fetch family name for display
        fam = await families_collection.find_one({"_id": ObjectId(r.get("family_id"))})
        if not fam: continue
        
        results.append({
            "id": str(r.get("_id")),
            "name": fam.get("head_name"),
            "type": r.get("request_type"),
            "amount": r.get("amount_requested"),
            "date": r.get("created_at").strftime("%Y-%m-%d") if isinstance(r.get("created_at"), datetime) else "N/A"
        })
    
    return results

@router.get("/accounts/overview", response_model=AccountOverview)
async def get_accounts_overview(committee_user = Depends(get_committee_user)):
    now = datetime.now()
    month_start = datetime(now.year, now.month, 1)
    
    # 1. Total Monthly Collection
    pipeline_monthly = [
        {"$match": {
            "status": "Completed",
            "payment_date": {"$gte": month_start}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    res_monthly = await contributions_collection.aggregate(pipeline_monthly).to_list(length=1)
    monthly_collection = res_monthly[0]["total"] if res_monthly else 0.0
    
    # 2. Total Expenses (Approved)
    pipeline_expenses = [
        {"$match": {"status": "Approved"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    res_expenses = await expenses_collection.aggregate(pipeline_expenses).to_list(length=1)
    total_expenses = res_expenses[0]["total"] if res_expenses else 0.0
    
    # 3. Breakdown
    breakdown = []
    pipeline_breakdown = [
        {"$match": {"status": "Approved"}},
        {"$group": {
            "_id": "$category",
            "amount": {"$sum": "$amount"}
        }}
    ]
    res_breakdown = await expenses_collection.aggregate(pipeline_breakdown).to_list(length=100)
    for rb in res_breakdown:
        breakdown.append({"category": rb["_id"], "amount": rb["amount"]})
        
    # 4. Total Collected (History)
    pipeline_history = [
        {"$match": {"status": "Completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    res_history = await contributions_collection.aggregate(pipeline_history).to_list(length=1)
    total_collected = res_history[0]["total"] if res_history else 0.0
    
    return {
        "opening_balance": total_collected - monthly_collection - total_expenses,
        "total_monthly_collection": monthly_collection,
        "total_expenses": total_expenses,
        "closing_balance": total_collected - total_expenses,
        "expense_breakdown": breakdown if breakdown else [{"category": "General", "amount": 0.0}]
    }

@router.get("/expenses", response_model=List[ExpenseSchema])
async def get_expenses(committee_user = Depends(get_committee_user)):
    cursor = expenses_collection.find().sort("date", -1)
    expenses = await cursor.to_list(length=1000)
    result = []
    for e in expenses:
        added_by = await users_collection.find_one({"_id": ObjectId(e.get("added_by"))}) if e.get("added_by") else None
        approved_by = await users_collection.find_one({"_id": ObjectId(e.get("approved_by"))}) if e.get("approved_by") else None
        
        result.append({
            "id": str(e.get("_id")),
            "category": e.get("category"),
            "amount": e.get("amount"),
            "description": e.get("description"),
            "status": e.get("status"),
            "date": e.get("date").strftime("%Y-%m-%d") if isinstance(e.get("date"), datetime) else str(e.get("date")),
            "added_by_name": added_by.get("name") if added_by else "System",
            "approved_by_name": approved_by.get("name") if approved_by else None
        })
    return result

@router.post("/expenses", response_model=dict)
async def create_expense(expense: ExpenseCreate, current_user = Depends(get_treasurer_user)):
    new_expense = {
        "category": expense.category,
        "amount": expense.amount,
        "description": expense.description,
        "added_by": current_user.get("id"),
        "status": "Pending",
        "date": datetime.utcnow()
    }
    result = await expenses_collection.insert_one(new_expense)
    
    # Audit Logging
    await log_action(current_user.get("id"), "CREATE", "Expense", str(result.inserted_id), {
        "category": expense.category,
        "amount": expense.amount
    })
    
    return {"message": "Expense record added, pending approval"}

@router.post("/expenses/{expense_id}/approve", response_model=dict)
async def approve_expense(expense_id: str, current_user = Depends(get_president_user)):
    expense = await expenses_collection.find_one({"_id": ObjectId(expense_id)})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    await expenses_collection.update_one(
        {"_id": ObjectId(expense_id)},
        {"$set": {
            "status": "Approved",
            "approved_by": current_user.get("id")
        }}
    )
    
    # Audit Logging
    await log_action(current_user.get("id"), "APPROVE", "Expense", expense_id, {
        "final_amount": expense.get("amount"),
        "category": expense.get("category")
    })
    
    return {"message": "Expense approved"}

@router.get("/audit-logs", response_model=List[dict])
async def get_audit_logs(current_user = Depends(get_president_user)):
    cursor = audit_logs_collection.find().sort("timestamp", -1).limit(100)
    logs = await cursor.to_list(length=100)
    result = []
    for l in logs:
        user = await users_collection.find_one({"_id": ObjectId(l.get("user_id"))}) if l.get("user_id") else None
        result.append({
            "id": str(l.get("_id")),
            "user_name": user.get("name") if user else "System",
            "action": l.get("action"),
            "target": f"{l.get('target_type')} #{l.get('target_id')}",
            "details": str(l.get("details")),
            "time": l.get("timestamp").strftime("%Y-%m-%d %H:%M:%S") if isinstance(l.get("timestamp"), datetime) else str(l.get("timestamp"))
        })
    return result

@router.get("/my-stats", response_model=dict)
async def get_my_family_stats(current_user: dict = Depends(get_current_user)):
    family_id = current_user.get("family_id")
    if not family_id:
        fam = await families_collection.find_one({"user_id": current_user.get("id")})
        if fam:
            family_id = str(fam.get("_id"))
    
    if not family_id:
        return {"total_contributed": 0.0, "last_payment_date": None, "status": "Not Linked"}

    # 2. Sum contributions
    pipeline = [
        {"$match": {
            "family_id": family_id,
            "status": "Completed"
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    res = await contributions_collection.aggregate(pipeline).to_list(length=1)
    total = res[0]["total"] if res else 0.0

    # 3. Last payment
    last_p = await contributions_collection.find_one(
        {"family_id": family_id, "status": "Completed"},
        sort=[("payment_date", -1)]
    )

    return {
        "total_contributed": total,
        "last_payment_date": last_p.get("payment_date").strftime("%Y-%m-%d") if last_p and last_p.get("payment_date") else "N/A",
        "status": "UP TO DATE" if total > 0 else "PENDING"
    }

@router.get("/contributions", response_model=List[ContributionSchema])
async def get_contributions(
    limit: int = 20, 
    payment_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    # 1. Role-based Filters
    if current_user.get("role") in ['family_head', 'family_member']:
        family_id = current_user.get("family_id")
        if not family_id:
            fam = await families_collection.find_one({"user_id": current_user.get("id")})
            if fam:
                family_id = str(fam.get("_id"))
        
        if not family_id:
            return []
        query["family_id"] = family_id
            
    # 2. General Filters
    if payment_type and payment_type != 'All':
         query["payment_type"] = payment_type
         
    if start_date or end_date:
        query["payment_date"] = {}
        if start_date:
            try:
                query["payment_date"]["$gte"] = datetime.strptime(start_date, "%Y-%m-%d")
            except: pass
        if end_date:
            try:
                query["payment_date"]["$lte"] = datetime.strptime(end_date, "%Y-%m-%d")
            except: pass

    cursor = contributions_collection.find(query).sort("payment_date", -1).limit(limit)
    contributions = await cursor.to_list(length=limit)
    
    if not contributions and await contributions_collection.count_documents({}) == 0:
         if current_user.get("role") not in ['family_head', 'family_member']:
            return [
                {"id": "mock1", "family_name": "Ramesh Kumar", "amount": 500.0, "date": "2024-01-25", "type": "Monthly"},
                {"id": "mock2", "family_name": "Suresh Singh", "amount": 1000.0, "date": "2024-01-24", "type": "Donation"},
                {"id": "mock3", "family_name": "Anita Devi", "amount": 500.0, "date": "2024-01-22", "type": "Monthly"},
            ]
        
    result = []
    for c in contributions:
        fam = await families_collection.find_one({"_id": ObjectId(c.get("family_id"))}) if c.get("family_id") else None
        fam_name = fam.get("head_name") if fam else (c.get("family_name") or "Unknown")
            
        result.append({
            "id": str(c.get("_id")),
            "family_name": fam_name,
            "amount": c.get("amount"),
            "date": c.get("payment_date").strftime("%Y-%m-%d") if isinstance(c.get("payment_date"), datetime) else "N/A",
            "type": c.get("payment_type")
        })
    return result

# --- COLLECTION CAMPAIGNS ---

@router.get("/approved-assistance", response_model=List[dict])
async def get_approved_assistance_requests(current_user = Depends(get_treasurer_user)):
    """Treasurer sees approved assistance requests that haven't been linked to a campaign yet."""
    cursor = assistance_requests_collection.find({"status": "Approved"})
    requests = await cursor.to_list(length=100)
    
    results = []
    for r in requests:
        exists = await collection_campaigns_collection.find_one({"assistance_request_id": str(r["_id"])})
        if exists: continue

        fam = await families_collection.find_one({"_id": ObjectId(r.get("family_id"))})
        results.append({
            "id": str(r["_id"]),
            "head_name": fam.get("head_name") if fam else "Unknown",
            "type": r.get("request_type"),
            "amount": r.get("amount_requested"),
            "description": r.get("description"),
            "date": r.get("created_at").strftime("%Y-%m-%d") if r.get("created_at") else "N/A"
        })
    return results

@router.post("/campaigns", response_model=CollectionCampaignResponse)
async def create_campaign(campaign: CollectionCampaignCreate, current_user = Depends(get_treasurer_user)):
    new_campaign = campaign.dict()
    new_campaign["status"] = "Active"
    new_campaign["collected_amount"] = 0.0
    new_campaign["created_at"] = datetime.utcnow()
    new_campaign["created_by"] = str(current_user["_id"])
    
    result = await collection_campaigns_collection.insert_one(new_campaign)
    new_campaign["_id"] = result.inserted_id
    
    await log_action(current_user["id"], "START_CAMPAIGN", "CollectionCampaign", str(result.inserted_id), {
        "title": campaign.title,
        "target": campaign.target_amount
    })
    
    return new_campaign

@router.get("/campaigns", response_model=List[CollectionCampaignResponse])
async def get_active_campaigns():
    """Public/Global endpoint for all members to see active fundraising."""
    cursor = collection_campaigns_collection.find({"status": "Active"}).sort("created_at", -1)
    campaigns = await cursor.to_list(length=100)
    return campaigns

@router.post("/campaigns/{campaign_id}/proof", response_model=CollectionCampaignResponse)
async def submit_contribution_proof(
    campaign_id: str, 
    proof: ContributionProofCreate, 
    current_user = Depends(get_current_user)
):
    camp = await collection_campaigns_collection.find_one({"_id": ObjectId(campaign_id)})
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    fam = await families_collection.find_one({"user_id": str(current_user["_id"])})
    if not fam:
         fam = await families_collection.find_one({"_id": ObjectId(current_user.get("family_id"))}) if current_user.get("family_id") else None

    new_proof = proof.dict()
    new_proof["family_id"] = str(fam["_id"]) if fam else "External"
    new_proof["head_name"] = fam.get("head_name") if fam else current_user["name"]
    new_proof["status"] = "Pending"
    new_proof["submitted_at"] = datetime.utcnow()
    
    await contribution_proofs_collection.insert_one(new_proof)
    
    return camp

@router.get("/campaigns/{campaign_id}/receipts", response_model=List[ContributionProofResponse])
async def get_campaign_receipts(campaign_id: str, current_user = Depends(get_committee_user)):
    cursor = contribution_proofs_collection.find({"campaign_id": campaign_id}).sort("submitted_at", -1)
    return await cursor.to_list(length=1000)

