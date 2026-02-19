from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List
from database import users_collection, elections_collection, election_posts_collection, candidates_collection, votes_collection, committee_history_collection
from dependencies import get_current_user
import json
import datetime
from bson import ObjectId

router = APIRouter()

async def get_president_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("position") != "president" and current_user.get("role") != "super_admin" and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only the President can perform this action")
    return current_user

@router.post("/create", response_model=dict)
async def create_election(
    title: str = Body(...),
    description: str = Body(None),
    start_date: str = Body(...),
    end_date: str = Body(...),
    posts: List[dict] = Body(...), # [{"name": "president", "seats": 1}, ...]
    current_user: dict = Depends(get_president_user)
):
    new_election = {
        "title": title,
        "description": description,
        "status": "active",
        "start_date": datetime.datetime.fromisoformat(start_date.replace('Z', '')),
        "end_date": datetime.datetime.fromisoformat(end_date.replace('Z', '')),
        "created_at": datetime.datetime.utcnow()
    }
    result = await elections_collection.insert_one(new_election)
    election_id = str(result.inserted_id)

    for p in posts:
        post = {
            "election_id": election_id,
            "post_name": p['name'],
            "seat_count": p.get('seats', 1)
        }
        await election_posts_collection.insert_one(post)
    
    return {"id": election_id, "message": "Election created and is now active"}

@router.get("/active", response_model=List[dict])
async def get_active_elections():
    cursor = elections_collection.find({"status": "active"})
    elections = await cursor.to_list(length=100)
    result = []
    for e in elections:
        e_id = str(e.get("_id"))
        post_cursor = election_posts_collection.find({"election_id": e_id})
        posts_data = await post_cursor.to_list(length=100)
        
        posts = []
        for p in posts_data:
            p_id = str(p.get("_id"))
            cand_cursor = candidates_collection.find({"post_id": p_id})
            candidates_data = await cand_cursor.to_list(length=1000)
            
            candidates = []
            for c in candidates_data:
                user = await users_collection.find_one({"_id": ObjectId(c.get("user_id"))})
                candidates.append({
                    "id": str(c.get("_id")),
                    "user_id": c.get("user_id"),
                    "name": user.get("name") if user else "Unknown",
                    "manifesto": c.get("manifesto")
                })
            posts.append({
                "id": p_id,
                "name": p.get("post_name"),
                "seats": p.get("seat_count"),
                "candidates": candidates
            })
        result.append({
            "id": e_id,
            "title": e.get("title"),
            "description": e.get("description"),
            "end_date": e.get("end_date"),
            "posts": posts
        })
    return result

@router.post("/vote/{election_id}")
async def submit_vote(
    election_id: str,
    selections: List[dict] = Body(...), # [{"post_id": "...", "candidate_id": "..."}]
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")
    # Check if already voted
    existing_vote = await votes_collection.find_one({"election_id": election_id, "voter_id": user_id})
    if existing_vote:
        raise HTTPException(status_code=400, detail="You have already cast your vote in this election")

    # Check if election is active
    election = await elections_collection.find_one({"_id": ObjectId(election_id), "status": "active"})
    if not election:
        raise HTTPException(status_code=404, detail="Active election not found")

    new_vote = {
        "election_id": election_id,
        "voter_id": user_id,
        "selections": json.dumps(selections),
        "voted_at": datetime.datetime.utcnow()
    }
    await votes_collection.insert_one(new_vote)
    return {"message": "Vote cast successfully"}

@router.post("/declare-results/{election_id}")
async def declare_results(
    election_id: str,
    current_user: dict = Depends(get_president_user)
):
    election = await elections_collection.find_one({"_id": ObjectId(election_id), "status": "active"})
    if not election:
        raise HTTPException(status_code=404, detail="Active election not found")

    # Tally votes (Simplified: first past the post)
    cursor = votes_collection.find({"election_id": election_id})
    votes = await cursor.to_list(length=10000)
    tally = {} # {post_id: {candidate_id: count}}

    for v in votes:
        sel = v.get("selections")
        if isinstance(sel, str):
            sel = json.loads(sel)
        for s in sel:
            p_id = s['post_id']
            c_id = s['candidate_id']
            if p_id not in tally: tally[p_id] = {}
            tally[p_id][c_id] = tally[p_id].get(c_id, 0) + 1

    winners = []
    
    # Process each post
    post_cursor = election_posts_collection.find({"election_id": election_id})
    posts = await post_cursor.to_list(length=100)
    
    for post in posts:
        p_id = str(post.get("_id"))
        if p_id in tally:
            # Sort candidates by vote count
            sorted_candidates = sorted(tally[p_id].items(), key=lambda x: x[1], reverse=True)
            seat_count = post.get("seat_count", 1)
            candidate_winners = sorted_candidates[:seat_count]
            
            for c_id, count in candidate_winners:
                candidate = await candidates_collection.find_one({"_id": ObjectId(c_id)})
                if candidate:
                    user = await users_collection.find_one({"_id": ObjectId(candidate.get("user_id"))})
                    winners.append({
                        "post_name": post.get("post_name"),
                        "user_id": candidate.get("user_id"),
                        "name": user.get("name") if user else "Unknown"
                    })

    # APPLY CHANGES
    # 1. Clear current positions of everyone except Super Admin
    await users_collection.update_many(
        {"role": {"$ne": "super_admin"}},
        {"$set": {"position": "none"}}
    )
    
    for w in winners:
        user_id = w.get("user_id")
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"position": w['post_name']}}
        )
        # Record in history
        history = {
            "user_id": user_id,
            "position": w['post_name'],
            "term_start": datetime.datetime.utcnow(),
            "election_id": election_id
        }
        await committee_history_collection.insert_one(history)

    await elections_collection.update_one(
        {"_id": ObjectId(election_id)},
        {"$set": {"status": "finished"}}
    )
    
    return {"message": "Results declared and positions updated", "winners": winners}

@router.post("/candidates/nominate/{post_id}")
async def nominate_self(
    post_id: str,
    manifesto: str = Body(None, embed=True),
    current_user: dict = Depends(get_current_user)
):
    post = await election_posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
         raise HTTPException(status_code=404, detail="Post not found")
        
    existing = await candidates_collection.find_one({
        "election_id": post.get("election_id"),
        "user_id": current_user.get("id")
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="You are already a candidate in this election")

    new_candidate = {
        "post_id": post_id,
        "election_id": post.get("election_id"),
        "user_id": current_user.get("id"),
        "manifesto": manifesto
    }
    await candidates_collection.insert_one(new_candidate)
    return {"message": "Nomination successful"}

@router.get("/committee-history")
async def get_committee_history():
    cursor = committee_history_collection.find().sort("term_start", -1)
    history = await cursor.to_list(length=100)
    result = []
    for h in history:
        user = await users_collection.find_one({"_id": ObjectId(h.get("user_id"))})
        result.append({
            "name": user.get("name") if user else "Unknown",
            "position": h.get("position"),
            "start": h.get("term_start"),
            "end": h.get("term_end"),
            "election_id": h.get("election_id")
        })
    return result
