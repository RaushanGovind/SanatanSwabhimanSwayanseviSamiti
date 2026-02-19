import pymongo
from dotenv import load_dotenv
import os
import json
from datetime import datetime

# Load .env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print("=" * 70)
print("CREATING TEST APPLICATION FOR PRESIDENT VERIFICATION")
print("=" * 70)

try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DB_NAME]
    families_collection = db["families"]
    
    # Create a test family application
    test_family = {
        "head_name": "TEST FAMILY - DELETE ME",
        "father_name": "Test Father",
        "mobile": "9999999999",
        "email": "test@example.com",
        "status": "Pending",
        "verification_stage": "President Scrutiny",
        "registration_method": "Direct",
        "created_at": datetime.utcnow(),
        "form_data": json.dumps({
            "personalDetails": {
                "fullName": "TEST FAMILY - DELETE ME",
                "fatherName": "Test Father",
                "mobile": "9999999999",
                "email": "test@example.com"
            },
            "verification_stage": "President Scrutiny",
            "status": "Pending"
        }),
        "remarks": []
    }
    
    result = families_collection.insert_one(test_family)
    
    print(f"\n✅ TEST APPLICATION CREATED!")
    print(f"   ID: {result.inserted_id}")
    print(f"   Name: TEST FAMILY - DELETE ME")
    print(f"   Stage: President Scrutiny")
    print(f"   Status: Pending")
    
    print(f"\n📋 Now you can:")
    print(f"   1. Refresh the browser")
    print(f"   2. Go to 'Pending Registrations' tab")
    print(f"   3. See 'TEST FAMILY - DELETE ME' at President Scrutiny")
    print(f"   4. Click 'Verify & Forward' to test")
    
    print(f"\n⚠️  This is a test record. Delete it after testing!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
