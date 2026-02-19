"""
Verify the correct database: jagdamba_samiti
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "jagdamba_samiti"  # With 'b'

async def verify_db():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    families_collection = db["families"]
    
    # Check total families
    count = await families_collection.count_documents({})
    print(f"Total families in '{DATABASE_NAME}': {count}")
    
    # Check for Raushan Kumar Jha
    raushan = await families_collection.find_one({"head_name": "Raushan Kumar Jha"})
    if raushan:
        print(f"Found Raushan Kumar Jha! ID: {raushan['_id']}, Stage: {raushan.get('verification_stage')}")
    else:
        print("Raushan Kumar Jha NOT found in this DB either.")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_db())
