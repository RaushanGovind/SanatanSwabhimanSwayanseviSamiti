from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def list_coordinators():
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    
    client = AsyncIOMotorClient(mongo_uri)
    db = client[db_name]
    users_collection = db["users"]
    
    print("Checking for coordinators...")
    # Search for "coordinator" in role or position
    cursor = users_collection.find({
        "$or": [
            {"role": {"$regex": "coordinator", "$options": "i"}},
            {"position": {"$regex": "coordinator", "$options": "i"}}
        ]
    })
    
    coordinators = await cursor.to_list(length=100)
    if not coordinators:
        print("No users found with role or position 'coordinator'.")
        
        print("\nAll unique roles in database:")
        roles = await users_collection.distinct("role")
        for r in roles:
            print(f"- {r}")
            
        print("\nAll unique positions in database:")
        positions = await users_collection.distinct("position")
        for p in positions:
            print(f"- {p}")
    else:
        for c in coordinators:
            print(f"Found: {c.get('name')} | Role: {c.get('role')} | Position: {c.get('position')}")

if __name__ == "__main__":
    asyncio.run(list_coordinators())
