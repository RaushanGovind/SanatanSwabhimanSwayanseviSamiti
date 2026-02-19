
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "jagdamba_samiti")

def check_recent():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("--- Last 5 Families ---")
    for fam in db.families.find().sort("created_at", -1).limit(5):
        print(f"ID={fam['_id']}, Head={fam.get('head_name')}, Status={fam.get('status')}, Created={fam.get('created_at')}")

    print("\n--- Last 5 Users ---")
    for user in db.users.find().sort("created_at", -1).limit(5):
        print(f"ID={user['_id']}, Name={user.get('name')}, Phone={user.get('phone')}, Created={user.get('created_at')}")

    print("\n--- Checking Inquiries ---")
    for inq in db.inquiries.find({"name": {"$regex": "Nitish", "$options": "i"}}):
        print(f"Inquiry Found: {inq}")

if __name__ == "__main__":
    check_recent()
