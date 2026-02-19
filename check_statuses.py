import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def run():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DB_NAME")]
    print(f"Checking DB: {os.getenv('DB_NAME')}")
    
    print(f"Collections: {await db.list_collection_names()}")
    
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    cursor = db.families.aggregate(pipeline)
    async for r in cursor:
        print(f"Status: {r['_id']} | count: {r['count']}")

if __name__ == "__main__":
    asyncio.run(run())
