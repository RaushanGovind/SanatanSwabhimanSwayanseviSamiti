
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Replicate backend path logic
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print(f"Connecting to {DB_NAME}...")

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        users = db["users"]
        
        # Search for Rajesh
        cursor = users.find({"name": {"$regex": "Rajesh", "$options": "i"}})
        found = False
        async for u in cursor:
            found = True
            print(f"User: {u.get('name')}")
            print(f"  Role: {u.get('role')}")
            print(f"  Position: {u.get('position')}")
            print(f"  Is Active: {u.get('is_active', 'Not Set (Default True?)')}")
            print(f"  ID: {u.get('_id')}")
            
        if not found:
            print("Rajesh not found in DB.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
