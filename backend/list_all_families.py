"""
List all families in database with their current stages
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "jagdama_samiti"

async def list_all_families():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    families_collection = db["families"]
    
    cursor = families_collection.find({})
    families = await cursor.to_list(length=None)
    
    print(f"Total families in database: {len(families)}\n")
    print("=" * 80)
    
    for i, family in enumerate(families, 1):
        print(f"\n{i}. Family Details:")
        print(f"   ID: {family['_id']}")
        print(f"   Head Name: {family.get('head_name', 'N/A')}")
        print(f"   Status: {family.get('status', 'N/A')}")
        print(f"   Stage: {family.get('verification_stage', 'N/A')}")
        print(f"   Coordinator: {family.get('coordinator_name', 'Not Assigned')}")
        print(f"   Join Method: {family.get('join_method', 'N/A')}")
        print("-" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(list_all_families())
