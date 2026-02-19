
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "jagdamba_samiti")

def check_nitish():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    families_collection = db["families"]

    print("--- Searching Users ---")
    for user in users_collection.find({"name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"User Found: ID={user['_id']}, Name={user['name']}, Phone={user['phone']}, Role={user.get('role')}")

    print("\n--- Searching Families (by head_name) ---")
    for fam in families_collection.find({"head_name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"Family Found: ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}, Stage={fam.get('verification_stage')}")
        print(f"  User ID: {fam.get('user_id')}")

    print("\n--- Searching Pending Members (inside families) ---")
    # Check if Nitish is a pending member in any family
    for fam in families_collection.find({"pending_members": {"$exists": True, "$not": {"$size": 0}}}):
        p_mems = fam.get("pending_members", [])
        for pm in p_mems:
            mem_data = pm.get("member", {})
            name = mem_data.get("full_name", "")
            if "Nitish" in name:
                print(f"Pending Member Found: Name={name}, FamilyID={fam['_id']}, Stage={pm.get('verification_stage')}, RequestID={pm.get('request_id')}")

if __name__ == "__main__":
    check_nitish()
