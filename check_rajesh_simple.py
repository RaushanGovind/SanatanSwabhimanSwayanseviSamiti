import pymongo
from dotenv import load_dotenv
import os

# Load .env from backend directory
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print("=" * 70)
print("CHECKING RAJESH KUMAR USER")
print("=" * 70)

try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    
    # Find Rajesh
    rajesh = users_collection.find_one({"phone": "7700000001"})
    
    if rajesh:
        print("\n✅ RAJESH FOUND!")
        print(f"Name: {rajesh.get('name')}")
        print(f"Phone: {rajesh.get('phone')}")
        print(f"Role: {rajesh.get('role')}")
        print(f"Position: {rajesh.get('position')}")
        print(f"Has Password: {'Yes' if rajesh.get('password') else 'No'}")
    else:
        print("\n❌ RAJESH NOT FOUND!")
        
        # Search for any Rajesh
        all_rajesh = list(users_collection.find({"name": {"$regex": "rajesh", "$options": "i"}}))
        print(f"\nFound {len(all_rajesh)} users with 'rajesh' in name:")
        for u in all_rajesh:
            print(f"  - {u.get('name')} ({u.get('phone')}) - Role: {u.get('role')} - Position: {u.get('position')}")
    
    # Total users
    total = users_collection.count_documents({})
    print(f"\n📊 Total Users: {total}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
