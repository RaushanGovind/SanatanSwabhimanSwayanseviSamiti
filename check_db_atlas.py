from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

async def check_db():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    print(f"Connecting to: {db_name}")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    fam_count = await db.families.count_documents({})
    user_count = await db.users.count_documents({})
    print(f"Family count: {fam_count}")
    print(f"User count: {user_count}")
    
    if fam_count > 0:
        cursor = db.families.find({})
        async for fam in cursor:
            print(f"- {fam.get('head_name')} | Status: {fam.get('status')} | Stage: {fam.get('verification_stage')}")
            # Check for coordinator assignment
            if fam.get("coordinator_id"):
                print(f"  Assigned to: {fam.get('coordinator_name')} ({fam.get('coordinator_id')})")
            else:
                print("  NO Coordinator Assigned")
    
    # Check current user (from frontend session)
    # The user in the screenshot seemed to be 'SECRETARY'
    # Let's find users with position secretary
    sec = await db.users.find_one({"position": "secretary"})
    if sec:
        print(f"Found secretary: {sec.get('name')} | id: {str(sec['_id'])}")
    else:
        # Check case-insensitive
        sec = await db.users.find_one({"position": {"$regex": "^secretary$", "$options": "i"}})
        if sec:
            print(f"Found case-insensitive secretary: {sec.get('name')} | position: {sec.get('position')}")

if __name__ == "__main__":
    asyncio.run(check_db())
