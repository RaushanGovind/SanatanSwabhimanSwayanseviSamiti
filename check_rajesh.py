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
    
    user = await db.users.find_one({"name": "Rajesh Kumar"})
    if user:
        print(f"User: {user.get('name')}")
        print(f"Role: {user.get('role')}")
        print(f"Position: {user.get('position')}")
        print(f"ID: {str(user['_id'])}")
    else:
        print("User Rajesh Kumar not found")
        # List all users to see what we have
        print("All users:")
        cursor = db.users.find({})
        async for u in cursor:
            print(f"- {u.get('name')} | role: {u.get('role')} | pos: {u.get('position')}")

if __name__ == "__main__":
    asyncio.run(check_db())
