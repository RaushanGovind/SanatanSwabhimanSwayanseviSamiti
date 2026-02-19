
@router.post("/{family_id}/approve", response_model=dict)
async def approve_family_application(
    family_id: str,
    current_user: dict = Depends(get_president_user)
):
    """
    Final approval by President.
    1. Generates Family ID
    2. Generates Member IDs
    3. Creates User Account for Head
    4. Updates Family Status to Approved
    """
    # 1. Fetch Family
    family = await families_collection.find_one({"_id": ObjectId(family_id)})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
        
    if family.get("status") == "Approved":
        return {"message": "Family is already approved."}
        
    # 2. Generate Family ID (Format: F-YYYY-Sequence)
    # Get count of approved families for sequence
    count = await families_collection.count_documents({"status": "Approved"})
    seq = count + 1
    year = datetime.utcnow().year
    family_unique_id = f"F-{year}-{seq:04d}"
    
    # 3. Process Members and Generate Member IDs
    form_data = family.get("form_data")
    data = json.loads(form_data) if isinstance(form_data, str) else form_data
    
    members = data.get("members", [])
    updated_members = []
    for idx, mem in enumerate(members):
        mem_id = f"{family_unique_id}-M{idx+1:02d}"
        mem["member_id"] = mem_id
        updated_members.append(mem)
        
    data["members"] = updated_members
    data["family_unique_id"] = family_unique_id
    data["status"] = "Approved"
    
    # 4. Create User Account for Head
    head_phone = data.get("head_details", {}).get("mobile")
    head_name = data.get("head_details", {}).get("full_name")
    
    if not head_phone:
        raise HTTPException(status_code=400, detail="Head mobile number missing")
        
    # Check if user already exists
    existing_user = await users_collection.find_one({"phone": head_phone})
    user_id = existing_user.get("_id") if existing_user else None
    
    auto_password = f"FAM{head_phone[-4:]}" # Default password: FAM + last 4 digits of phone
    hashed_password = get_password_hash(auto_password)
    
    if not existing_user:
        new_user = {
            "name": head_name,
            "phone": head_phone,
            "role": "family_head",
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        ur = await users_collection.insert_one(new_user)
        user_id = ur.inserted_id
    else:
        # Update existing user role if needed
        if existing_user.get("role") not in ["admin", "super_admin", "family_head"]:
             await users_collection.update_one({"_id": user_id}, {"$set": {"role": "family_head"}})

    # 5. Update Family Record
    log_entry = {
        "stage": "President Approval",
        "action": "Final Approval Granted",
        "remark": f"Approved. ID: {family_unique_id}",
        "by": current_user.get("name"),
        "role": current_user.get("position"),
        "date": datetime.utcnow()
    }
    
    if "remarks" not in data: data["remarks"] = []
    data["remarks"].append(log_entry)

    await families_collection.update_one(
        {"_id": ObjectId(family_id)},
        {
            "$set": {
                "status": "Approved",
                "verification_stage": "Approved",
                "family_id": family_unique_id, # Store at root
                "user_id": str(user_id),       # Link to User
                "form_data": json.dumps(data, default=str)
            },
           "$push": {"remarks": log_entry}
        }
    )
    
    return {
        "message": f"Family Approved! ID: {family_unique_id}",
        "credentials": {
            "username": head_phone,
            "password": auto_password
        }
    }
