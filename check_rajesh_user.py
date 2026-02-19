
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print("=" * 70)
print("CHECKING RAJESH KUMAR'S USER ACCOUNT")
print("=" * 70)

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        users = db["users"]
        
        # Find Rajesh by phone
        rajesh = await users.find_one({"phone": "7700000001"})
        
        if rajesh:
            print(f"\n✅ RAJESH KUMAR FOUND IN DATABASE")
            print(f"\nUser Details:")
            print(f"  ID: {rajesh.get('_id')}")
            print(f"  Name: {rajesh.get('name')}")
            print(f"  Phone: {rajesh.get('phone')}")
            print(f"  Role: {rajesh.get('role')}")
            print(f"  Position: {rajesh.get('position')}")
            print(f"  Status: {rajesh.get('status', 'N/A')}")
            print(f"  Has Password: {'Yes' if rajesh.get('password') else 'No'}")
            
            # Check if he's a committee member
            is_committee = rajesh.get('role') in ['admin', 'super_admin'] or \
                          rajesh.get('position') in ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer']
            
            print(f"\n  Is Committee Member: {'✅ YES' if is_committee else '❌ NO'}")
            
        else:
            print(f"\n❌ RAJESH KUMAR NOT FOUND!")
            print(f"\nSearching for any user with 'rajesh' in name...")
            
            cursor = users.find({"name": {"$regex": "rajesh", "$options": "i"}})
            count = 0
            async for user in cursor:
                count += 1
                print(f"\n  Found: {user.get('name')} - Phone: {user.get('phone')} - Role: {user.get('role')} - Position: {user.get('position')}")
            
            if count == 0:
                print("  No users found with 'rajesh' in name")
        
        # Also check total users
        total_users = await users.count_documents({})
        print(f"\n📊 Total Users in Database: {total_users}")
        
        # Check committee members
        committee_count = await users.count_documents({
            "$or": [
                {"role": {"$in": ["admin", "super_admin"]}},
                {"position": {"$in": ["president", "vice_president", "secretary", "joint_secretary", "treasurer", "coordinator"]}}
            ]
        })
        print(f"👥 Committee Members: {committee_count}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
