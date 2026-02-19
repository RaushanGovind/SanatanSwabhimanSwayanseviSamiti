
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load .env
load_dotenv(dotenv_path="backend/.env")


async def check_target():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    
    if not uri:
        print("Error: MONGO_URI not found in environment")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    print(f"Connected to {db_name}")



async def check_target():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    
    if not uri:
        print("Error: MONGO_URI not found in environment")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    print(f"Connected to {db_name}")




    # Broad search for Sanjay
    print("\n--- BROAD SEARCH FOR SANJAY ---")
    cursor = db.users.find({"name": {"$regex": "SANJAY", "$options": "i"}})
    async for u in cursor:
        print(f"User: {u.get('name')} | Role: {u.get('role')} | Phone: {u.get('phone')}")


    # Search for problematic roles
    print("\n--- USERS WITH EMPTY/NULL/MISSING ROLES ---")
    cursor = db.users.find({
        "$or": [
            {"role": None},
            {"role": ""},
            {"role": {"$exists": False}}
        ]
    })
    async for u in cursor:
        print(f"Problem User: {u.get('name')} | Role: {u.get('role')} | Phone: {u.get('phone')}")




    # Search for user 7700000020
    print("\n--- SEARCH FOR USER 7700000020 ---")
    u = await db.users.find_one({"phone": "7700000020"})
    if u:
        print(f"User Found: {u.get('name')}")
        print(f"Role: {u.get('role')}")
        print(f"Position: {u.get('position')}")
        print(f"Raw Doc: {u}")
    else:
        print("User 7700000020 NOT FOUND.")


if __name__ == "__main__":
    asyncio.run(check_target())
