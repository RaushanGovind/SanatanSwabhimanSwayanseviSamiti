
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load .env
load_dotenv(dotenv_path="backend/.env")


async def check_target():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    
    if not uri:
        print("Error: MONGO_URI not found in environment")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    print(f"Connected to {db_name}")


    # 1. Search for ANY family in Secretary Scrutiny
    print("\n--- FAMILIES IN SECRETARY SCRUTINY ---")
    res = await db.families.find_one({"verification_stage": "Secretary Scrutiny"})
    if res:
        print(f"Found one family (ID: {res.get('_id')})")
        print("Raw Document Structure:")
        # Convert ObjectId to str for printing if needed, or just print roughly
        import pprint
        pprint.pprint(res)
    else:
        print("No families in Secretary Scrutiny found.")

    # 2. Search for Naveen again broadly
    print("\n--- SEARCH FOR NAVEEN ---")
    cursor = db.families.find({"head_details.full_name": {"$regex": "aveen", "$options": "i"}})
    found = False
    async for fam in cursor:
        print(f"Found: {fam.get('head_details', {}).get('full_name')} | Stage: {fam.get('verification_stage')}")
        found = True
    if not found:
        print("No 'aveen' found.")

    # 3. List first 5 families to verify structure
    print("\n--- FIRST 5 FAMILIES ---")
    cursor = db.families.find().limit(5)
    async for fam in cursor:
        print(f"- {fam.get('head_details', {}).get('full_name')} | Status: {fam.get('status')} | Stage: {fam.get('verification_stage')}")


if __name__ == "__main__":
    asyncio.run(check_target())
