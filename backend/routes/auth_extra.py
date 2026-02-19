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
