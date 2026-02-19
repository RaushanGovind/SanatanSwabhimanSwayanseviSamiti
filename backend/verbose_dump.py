"""
Verbose database dump to verify exact state of families collection
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pprint

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "jagdama_samiti"

async def dump_families():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    families_collection = db["families"]
    
    cursor = families_collection.find({})
    families = await cursor.to_list(length=None)
    
    print(f"Total documents in 'families' collection: {len(families)}")
    print("=" * 60)
    
    for family in families:
        print(f"ID: {family['_id']}")
        print(f"Head Name: {family.get('head_name', 'N/A')}")
        print(f"Head Details Name: {family.get('head_details', {}).get('full_name', 'N/A')}")
        print(f"Status: {family.get('status', 'N/A')}")
        print(f"Verification Stage: {family.get('verification_stage', 'N/A')}")
        print(f"Coordinator ID: {family.get('coordinator_id', 'N/A')}")
        print(f"Coordinator Name: {family.get('coordinator_name', 'N/A')}")
        print("-" * 60)
        
    client.close()

if __name__ == "__main__":
    asyncio.run(dump_families())
