"""
Check current verification stages in database
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "jagdama_samiti"

async def check_stages():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    families_collection = db["families"]
    
    # Find all pending families
    cursor = families_collection.find({"status": "Pending"})
    families = await cursor.to_list(length=None)
    
    print(f"Total Pending Families: {len(families)}\n")
    
    for family in families:
        family_name = family.get("head_name", "Unknown")
        stage = family.get("verification_stage", "Unknown")
        coord_id = family.get("coordinator_id", None)
        coord_name = family.get("coordinator_name", "Not Assigned")
        
        print(f"Family: {family_name}")
        print(f"  Stage: {stage}")
        print(f"  Coordinator: {coord_name} (ID: {coord_id})")
        print(f"  ID: {family['_id']}")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_stages())
