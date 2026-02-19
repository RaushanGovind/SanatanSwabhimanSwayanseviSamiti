import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio

env_path = os.path.join("backend", ".env")
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

async def test():
    client = AsyncIOMotorClient(MONGO_URI)
    
    # Check jagdamba_samiti
    db1 = client["jagdamba_samiti"]
    count1 = await db1.families.count_documents({})
    print(f"jagdamba_samiti families: {count1}")
    
    # Check MaaJagdambaSamiti
    db2 = client["MaaJagdambaSamiti"]
    count2 = await db2.families.count_documents({})
    print(f"MaaJagdambaSamiti families: {count2}")
    
    # Check users in jagdamba_samiti
    u1 = await db1.users.find_one({"name": {"$regex": "Rajesh Kumar", "$options": "i"}})
    print(f"Rajesh Kumar in jagdamba_samiti: {u1.get('name') if u1 else 'NO'}")

    # Check users in MaaJagdambaSamiti
    u2 = await db2.users.find_one({"name": {"$regex": "Rajesh Kumar", "$options": "i"}})
    print(f"Rajesh Kumar in MaaJagdambaSamiti: {u2.get('name') if u2 else 'NO'}")

if __name__ == "__main__":
    asyncio.run(test())
