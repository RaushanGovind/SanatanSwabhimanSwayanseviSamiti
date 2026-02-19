
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId

# Explicitly load from backend/.env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

def check_linkage():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("--- User: NITISH KUMAR ---")
    user = db.users.find_one({"name": {"$regex": "NITISH", "$options": "i"}})
    if not user:
        print("User not found")
        return

    user_id_str = str(user["_id"])
    print(f"User ID: {user_id_str}")
    print(f"User Phone: {user.get('phone')}")

    print("\n--- Family Linked to User ---")
    # Check exact string match
    fam = db.families.find_one({"user_id": user_id_str})
    if fam:
        print(f"Family Found (Direct Match): ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}")
    else:
        print("Family NOT found with user_id query.")
        
        # Check if it exists with ObjectId? (The code uses str, but let's check)
        fam_obj = db.families.find_one({"user_id": user["_id"]})
        if fam_obj:
             print(f"Family Found (ObjectId Match): ID={fam_obj['_id']}")
        else:
             # Find by name to see what the user_id actually is
             fam_name = db.families.find_one({"head_name": user["name"]})
             if fam_name:
                 print(f"Family Found (By Name): ID={fam_name['_id']}")
                 print(f"  Family user_id: {fam_name.get('user_id')} (Type: {type(fam_name.get('user_id'))})")
                 print(f"  Expected: {user_id_str}")

if __name__ == "__main__":
    check_linkage()
