import asyncio
from database import families_collection
from bson import json_util

async def check():
    # Search for Raushan Kumar Jha
    family = await families_collection.find_one({"head_name": {"$regex": "RAUSHAN", "$options": "i"}})
    if family:
        print("Family Found:")
        print(f"ID: {family.get('_id')}")
        print(f"Stage: '{family.get('verification_stage')}'")
        print(f"Status: {family.get('status')}")
    else:
        print("Family not found")

if __name__ == "__main__":
    asyncio.run(check())
