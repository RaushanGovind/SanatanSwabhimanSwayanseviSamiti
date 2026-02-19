import pymongo
from dotenv import load_dotenv
import os
import json

# Load .env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print("=" * 70)
print("RESET NAVEEN KUMAR TO PRESIDENT SCRUTINY")
print("=" * 70)

try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    families_collection = db["families"]
    
    # Find NAVEEN KUMAR
    naveen = families_collection.find_one({"head_name": "NAVEEN KUMAR"})
    
    if not naveen:
        print("\n❌ NAVEEN KUMAR not found!")
    else:
        print(f"\n✅ Found NAVEEN KUMAR")
        print(f"   Current Stage: {naveen.get('verification_stage')}")
        print(f"   Status: {naveen.get('status')}")
        
        # Reset to President Scrutiny
        update_result = families_collection.update_one(
            {"_id": naveen["_id"]},
            {
                "$set": {
                    "verification_stage": "President Scrutiny",
                    "status": "Pending"
                }
            }
        )
        
        # Also update form_data if it exists
        form_data = naveen.get("form_data")
        if form_data:
            try:
                data = json.loads(form_data) if isinstance(form_data, str) else form_data
                data["verification_stage"] = "President Scrutiny"
                data["status"] = "Pending"
                
                families_collection.update_one(
                    {"_id": naveen["_id"]},
                    {"$set": {"form_data": json.dumps(data)}}
                )
            except:
                pass
        
        print(f"\n✅ NAVEEN KUMAR RESET!")
        print(f"   New Stage: President Scrutiny")
        print(f"   Status: Pending")
        
        print(f"\n📋 Now you can:")
        print(f"   1. Refresh the browser")
        print(f"   2. Go to 'Pending Registrations' tab")
        print(f"   3. See NAVEEN KUMAR at President Scrutiny")
        print(f"   4. Click 'Verify & Forward' to test")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
