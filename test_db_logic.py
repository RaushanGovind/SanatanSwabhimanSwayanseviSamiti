import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

# The exact logic from database.py after my fix
env_path = os.path.join("backend", ".env")
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "jagdamba_samiti")

async def test():
    print(f"Connecting to {MONGO_URI}")
    print(f"DB Name: {DB_NAME}")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    count = await db.families.count_documents({})
    print(f"Family Count: {count}")
    
    user = await db.users.find_one({"name": {"$regex": "Rajesh", "$options": "i"}})
    if user:
        print(f"User Found: {user.get('name')}")
    else:
        print("User NOT Found")

if __name__ == "__main__":
    asyncio.run(test())
