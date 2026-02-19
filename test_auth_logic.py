import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from jose import jwt
import datetime

load_dotenv(dotenv_path="backend/.env")

SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_change_this_later")
ALGORITHM = "HS256"

async def test_auth():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    user = await db.users.find_one({"name": {"$regex": "Rajesh Kumar", "$options": "i"}})
    if not user:
        print("User not found")
        return
    
    user_id = str(user["_id"])
    role = user.get("role", "")
    pos = user.get("position", "")
    print(f"User: {user.get('name')} | ID: {user_id} | Role: {role} | Pos: {pos}")
    
    # Generate token
    token_data = {
        "sub": user_id,
        "role": role,
        "position": pos,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Token: {token}")
    
    # Now simulate the request to /api/families
    # 1. Decode token (simulating get_current_user)
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    sub = payload.get("sub")
    print(f"Decoded sub: {sub}")
    
    # 2. Fetch user
    from bson import ObjectId
    user_from_db = await db.users.find_one({"_id": ObjectId(sub)})
    if user_from_db:
        print(f"User found in DB: {user_from_db.get('name')}")
    else:
        print("User NOT found in DB by sub")
        
    # 3. Check committee status
    committee_roles = ['admin', 'super_admin', 'president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'joint_treasurer', 'executive_member', 'coordinator']
    u_role = user_from_db.get("role", "").lower()
    u_pos = user_from_db.get("position", "").lower()
    is_comm = u_role in committee_roles or u_pos in committee_roles
    print(f"Is Committee: {is_comm}")
    
    # 4. Check query
    is_admin = u_role in ["admin", "super_admin"] or u_pos in ["president", "vice_president", "secretary", "joint_secretary", "treasurer", "joint_treasurer"]
    print(f"Is Admin for query: {is_admin}")

if __name__ == "__main__":
    asyncio.run(test_auth())
