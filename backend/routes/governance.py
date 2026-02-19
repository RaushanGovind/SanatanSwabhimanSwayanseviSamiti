from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from database import users_collection, strikes_collection, strike_interactions_collection, performance_ratings_collection, audit_logs_collection, committee_history_collection, families_collection
from dependencies import get_current_user
import datetime
import json
from bson import ObjectId
from utils.audit import log_action

router = APIRouter()

async def get_family_head(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["family_head", "admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only Family Heads can participate in this process")
    return current_user

# --- REMOVAL / STRIKE PROCESS ---

@router.post("/strikes/initiate")
async def initiate_strike(
    target_user_id: str = Body(...),
    reason: str = Body(...),
    current_user: dict = Depends(get_family_head)
):
    # Check if target is an office bearer
    target = await users_collection.find_one({"_id": ObjectId(target_user_id)})
    if not target or target.get("position") == "none":
        raise HTTPException(status_code=400, detail="Target user is not an office bearer")
    
    # Check for protection period (6 months)
    six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
    existing = await strikes_collection.find_one({
        "target_user_id": target_user_id,
        "created_at": {"$gte": six_months_ago},
        "status": {"$ne": "failed"}
    })
    if existing:
        raise HTTPException(status_code=400, detail="A removal process was already initiated for this person recently")

    # Initiate petition phase
    new_strike = {
        "target_user_id": target_user_id,
        "initiator_id": current_user.get("id"),
        "reason": reason,
        "status": "petition",
        "created_at": datetime.datetime.utcnow(),
        "expires_at": datetime.datetime.utcnow() + datetime.timedelta(days=7) # 7 days to gather support
    }
    result = await strikes_collection.insert_one(new_strike)
    strike_id = str(result.inserted_id)

    # Auto-add initiator's support
    await strike_interactions_collection.insert_one({
        "strike_id": strike_id,
        "voter_id": current_user.get("id"),
        "is_vote": False
    })
    
    # Audit log initiation
    await log_action(current_user.get("id"), "STRIKE_INITIATED", "User", target_user_id, {
        "reason": reason,
        "target_name": target.get("name"),
        "target_position": target.get("position")
    })

    return {"message": "Removal petition initiated. 25% support required to move to voting.", "strike_id": strike_id}

@router.post("/strikes/{strike_id}/support")
async def support_strike(
    strike_id: str,
    current_user: dict = Depends(get_family_head)
):
    strike = await strikes_collection.find_one({"_id": ObjectId(strike_id), "status": "petition"})
    if not strike:
        raise HTTPException(status_code=404, detail="Active petition not found")
    
    if datetime.datetime.utcnow() > strike.get("expires_at"):
        await strikes_collection.update_one({"_id": ObjectId(strike_id)}, {"$set": {"status": "failed"}})
        raise HTTPException(status_code=400, detail="Petition period has expired")

    user_id = current_user.get("id")
    # Check if already supported
    existing = await strike_interactions_collection.find_one({
        "strike_id": strike_id, 
        "voter_id": user_id,
        "is_vote": False
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already supported this petition")

    await strike_interactions_collection.insert_one({
        "strike_id": strike_id, 
        "voter_id": user_id, 
        "is_vote": False
    })

    # Check threshold (25% of Family Heads)
    total_heads = await users_collection.count_documents({"role": "family_head"})
    total_supports = await strike_interactions_collection.count_documents({
        "strike_id": strike_id, 
        "is_vote": False
    })

    if total_supports >= (total_heads * 0.25):
        await strikes_collection.update_one(
            {"_id": ObjectId(strike_id)},
            {"$set": {
                "status": "voting",
                "voting_start_at": datetime.datetime.utcnow(),
                "expires_at": datetime.datetime.utcnow() + datetime.timedelta(hours=72)
            }}
        )
        return {"message": "Threshold reached! Voting phase has started.", "status": "voting"}

    return {"message": "Support recorded", "current_supports": total_supports, "required": int(total_heads * 0.25)}

@router.post("/strikes/{strike_id}/vote")
async def vote_strike(
    strike_id: str,
    approve: bool = Body(...), # True to Remove, False to Keep
    current_user: dict = Depends(get_family_head)
):
    strike = await strikes_collection.find_one({"_id": ObjectId(strike_id), "status": "voting"})
    if not strike:
        raise HTTPException(status_code=404, detail="Voting period not active")
    
    if datetime.datetime.utcnow() > strike.get("expires_at"):
        return await finalize_strike(strike_id)

    user_id = current_user.get("id")
    # Check if already voted
    existing = await strike_interactions_collection.find_one({
        "strike_id": strike_id, 
        "voter_id": user_id,
        "is_vote": True
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already cast your vote")

    await strike_interactions_collection.insert_one({
        "strike_id": strike_id, 
        "voter_id": user_id, 
        "is_vote": True, 
        "choice": approve
    })

    return {"message": "Vote cast successfully (secret ballot)"}

@router.get("/strikes/active")
async def get_active_strikes():
    cursor = strikes_collection.find({"status": {"$in": ["petition", "voting"]}})
    strikes = await cursor.to_list(length=100)
    result = []
    total_heads = await users_collection.count_documents({"role": "family_head"})
    for s in strikes:
        s_id = str(s.get("_id"))
        supports = await strike_interactions_collection.count_documents({"strike_id": s_id, "is_vote": False})
        votes_count = await strike_interactions_collection.count_documents({"strike_id": s_id, "is_vote": True})
        
        target = await users_collection.find_one({"_id": ObjectId(s.get("target_user_id"))})
        
        result.append({
            "id": s_id,
            "target": {"id": str(target.get("_id")), "name": target.get("name"), "position": target.get("position")} if target else None,
            "reason": s.get("reason"),
            "status": s.get("status"),
            "expires_at": s.get("expires_at"),
            "petition_progress": {"current": supports, "required": int(total_heads * 0.25)},
            "vote_count": votes_count
        })
    return result

async def finalize_strike(strike_id: str):
    strike = await strikes_collection.find_one({"_id": ObjectId(strike_id)})
    cursor = strike_interactions_collection.find({"strike_id": strike_id, "is_vote": True})
    votes = await cursor.to_list(length=10000)
    
    if not votes:
        await strikes_collection.update_one({"_id": ObjectId(strike_id)}, {"$set": {"status": "failed"}})
        return {"message": "Strike failed due to no participation"}

    yes_votes = len([v for v in votes if v.get("choice") == True])
    total_votes = len(votes)

    if yes_votes >= (total_votes * (2/3)):
        await strikes_collection.update_one({"_id": ObjectId(strike_id)}, {"$set": {"status": "passed"}})
        # REMOVE OFFICIAL
        target_id = strike.get("target_user_id")
        target = await users_collection.find_one({"_id": ObjectId(target_id)})
        
        old_position = target.get("position")
        
        # Determine base role
        is_head = await families_collection.find_one({"user_id": target_id})
        new_role = "family_head" if is_head else "member"
        
        # Log it
        await log_action(target_id, "REMOVAL", "UserPosition", target_id, {
            "old_position": old_position,
            "yes_votes": yes_votes,
            "total_votes": total_votes,
            "participation": f"{yes_votes}/{total_votes}",
            "reason": strike.get("reason"),
            "reverted_to_role": new_role
        })

        # Update Committee History
        await committee_history_collection.update_one(
            {"user_id": target_id, "term_end": None},
            {"$set": {"term_end": datetime.datetime.utcnow()}}
        )

        await users_collection.update_one(
            {"_id": ObjectId(target_id)},
            {"$set": {"position": "none", "role": new_role}}
        )
        return {"message": f"Removal approved by 2/3 majority ({yes_votes}/{total_votes}). {target.get('name')} has been reverted to {new_role}.", "status": "passed"}
    else:
        await strikes_collection.update_one({"_id": ObjectId(strike_id)}, {"$set": {"status": "failed"}})
        return {"message": "Removal failed. Majority (2/3) not met.", "details": f"{yes_votes}/{total_votes} in favor.", "status": "failed"}

# --- PERFORMANCE RATING SYSTEM ---

@router.post("/ratings/submit")
async def submit_rating(
    target_user_id: str = Body(...),
    stars: int = Body(...), # 1-5
    feedback: str = Body(None),
    current_user: dict = Depends(get_family_head)
):
    if stars < 1 or stars > 5:
        raise HTTPException(status_code=400, detail="Invalid star rating")

    # Check if target is/was an office bearer
    target = await users_collection.find_one({"_id": ObjectId(target_user_id)})
    history_exists = await committee_history_collection.find_one({"user_id": target_user_id})
    
    if not target or (target.get("position") == "none" and not history_exists):
         raise HTTPException(status_code=400, detail="You can only rate office bearers")

    # Cycle check (once every 6 months)
    six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
    existing = await performance_ratings_collection.find_one({
        "target_user_id": target_user_id,
        "rater_id": current_user.get("id"),
        "created_at": {"$gte": six_months_ago}
    })
    if existing:
        raise HTTPException(status_code=400, detail="You can only rate this leader once every 6 months")

    new_rating = {
        "target_user_id": target_user_id,
        "rater_id": current_user.get("id"),
        "stars": stars,
        "feedback": feedback,
        "term_year": datetime.datetime.utcnow().year,
        "created_at": datetime.datetime.utcnow()
    }
    await performance_ratings_collection.insert_one(new_rating)
    
    # Audit log rating
    await log_action(current_user.get("id"), "RATED_LEADER", "User", target_user_id, {
        "stars": stars,
        "target_name": target.get("name")
    })
    
    return {"message": "Rating submitted! Leadership performance tracked."}

@router.get("/ratings/leader/{user_id}")
async def get_leader_performance(user_id: str):
    cursor = performance_ratings_collection.find({"target_user_id": user_id})
    ratings = await cursor.to_list(length=10000)
    
    if not ratings:
        return {"average": 0, "total_voters": 0, "history": []}
    
    avg = sum([r.get("stars") for r in ratings]) / len(ratings)
    
    # Group by year for history
    history = {}
    feedback_list = []
    for r in ratings:
        year = r.get("term_year", datetime.datetime.utcnow().year)
        if year not in history: history[year] = {"sum": 0, "count": 0}
        history[year]["sum"] += r.get("stars")
        history[year]["count"] += 1
        if r.get("feedback"):
            feedback_list.append(r.get("feedback"))
    
    formatted_history = []
    for y, data in history.items():
        formatted_history.append({
            "year": y,
            "average": round(data["sum"] / data["count"], 1),
            "voters": data["count"]
        })

    return {
        "average": round(avg, 1),
        "total_voters": len(ratings),
        "history": formatted_history,
        "recent_feedback": feedback_list[-5:]
    }

@router.get("/committee/performance")
async def get_all_committee_performance():
    cursor = users_collection.find({"position": {"$ne": "none"}})
    committee = await cursor.to_list(length=100)
    result = []
    for member in committee:
        perf = await get_leader_performance(str(member.get("_id")))
        result.append({
            "id": str(member.get("_id")),
            "name": member.get("name"),
            "position": member.get("position"),
            "performance": perf
        })
    return result
