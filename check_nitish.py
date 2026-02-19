
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "jagdamba_samiti")

async def check_nitish():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db.get_collection("users")
    families_collection = db.get_collection("families")

    print("--- Searching Users ---")
    async for user in users_collection.find({"name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"User Found: ID={user['_id']}, Name={user['name']}, Phone={user['phone']}, Role={user.get('role')}")

    print("\n--- Searching Families (by head_name or form_data) ---")
    # Search by top-level head_name
    async for fam in families_collection.find({"head_name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"Family Found (by head_name): ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}, Stage={fam.get('verification_stage')}")
        print(f"  User ID: {fam.get('user_id')}")

    # Search inside form_data (less efficient but necessary if head_name wasn't set)
    # We'll just fetch all and check because regex on json string in mongo is tricky/slow but fine for debug script
    print("\n--- Deep Search in Family Form Data ---")
    count = 0
    async for fam in families_collection.find({}):
        form_data = fam.get("form_data")
        if form_data and isinstance(form_data, str) and "Nitish" in form_data:
            print(f"Family Found (in form_data): ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}, Stage={fam.get('verification_stage')}")
            try:
                data = json.loads(form_data)
                print(f"  Head Name in Form: {data.get('head_details', {}).get('full_name')}")
            except:
                pass
            count += 1
    
    if count == 0:
        print("No matches found in form_data deep search.")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(check_nitish())
