
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

# Explicitly load from backend/.env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print(f"Connecting to DB: {DB_NAME} at ...{MONGO_URI[-20:] if MONGO_URI else 'None'}")

def check_nitish():
    if not MONGO_URI:
        print("Error: MONGO_URI not found in backend/.env")
        return

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    families_collection = db["families"]

    print(f"Users Count: {users_collection.count_documents({})}")
    print(f"Families Count: {families_collection.count_documents({})}")

    print("--- Searching Users (Nitish) ---")
    count = 0
    for user in users_collection.find({"name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"User Found: ID={user['_id']}, Name={user['name']}, Phone={user['phone']}, Role={user.get('role')}")
        count += 1
    if count == 0: print("No users found with name 'Nitish'.")

    print("\n--- Searching Families (by head_name or form_data for Nitish) ---")
    count = 0
    # Head Name Search
    for fam in families_collection.find({"head_name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"Family Found (Head): ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}, Stage={fam.get('verification_stage')}")
        count += 1
    
    # Form Data Search
    # This is slow but necessary if head_name wasn't populated correctly
    print("Searching inside form_data...")
    for fam in families_collection.find({}):
        form_data = fam.get("form_data")
        if form_data and isinstance(form_data, str):
            if "Nitish" in form_data:
                 print(f"Family Found (in JSON): ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}")
                 count += 1

    if count == 0: print("No families found matching 'Nitish'.")
    
    print("\n--- Searching Pending Members (Nitish) ---")
    for fam in families_collection.find({"pending_members": {"$exists": True, "$not": {"$size": 0}}}):
        p_mems = fam.get("pending_members", [])
        for pm in p_mems:
            mem_data = pm.get("member", {})
            name = mem_data.get("full_name", "")
            if "Nitish" in name:
                print(f"Pending Member Found: Name={name}, FamilyID={fam['_id']}, Stage={pm.get('verification_stage')}, RequestID={pm.get('request_id')}")

if __name__ == "__main__":
    check_nitish()
