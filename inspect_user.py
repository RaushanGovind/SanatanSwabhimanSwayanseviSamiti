import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def run():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DB_NAME")]
    cursor = db.users.find({"name": {"$regex": "Rajesh", "$options": "i"}})
    async for u in cursor:
        print(f"MATCH: {u['name']} | role: {u.get('role')} | pos: {u.get('position')} | status: {u.get('status')}")

if __name__ == "__main__":
    asyncio.run(run())
