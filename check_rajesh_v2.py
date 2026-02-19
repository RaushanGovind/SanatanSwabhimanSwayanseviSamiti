from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

async def check_db():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    # Search by name regex
    print("Searching for Rajesh...")
    cursor = db.users.find({"name": {"$regex": "Rajesh", "$options": "i"}})
    async for u in cursor:
        print(f"Match Name: {u.get('name')} | role: {u.get('role')} | pos: {u.get('position')} | id: {str(u['_id'])}")

    # Search by position regex
    print("\nSearching for President position...")
    cursor = db.users.find({"position": {"$regex": "president", "$options": "i"}})
    async for u in cursor:
        print(f"Match Pos: {u.get('name')} | role: {u.get('role')} | pos: {u.get('position')} | id: {str(u['_id'])}")

if __name__ == "__main__":
    asyncio.run(check_db())
