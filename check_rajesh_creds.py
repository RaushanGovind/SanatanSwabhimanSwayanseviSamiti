
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Replicate backend path logic
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print(f"Searching for Rajesh Kumar (President) credentials...")

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        users = db["users"]
        
        # Find Rajesh Kumar (President)
        user = await users.find_one({"name": "Rajesh Kumar (President)"})
        
        if user:
            print(f"\nFound user:")
            print(f"  Name: {user.get('name')}")
            print(f"  Phone: {user.get('phone')}")
            print(f"  Role: {user.get('role')}")
            print(f"  Position: {user.get('position')}")
            print(f"  Has password: {'Yes' if user.get('password') else 'No'}")
            print(f"  Password hash (first 30 chars): {user.get('password', 'N/A')[:30]}...")
            print(f"  Is Active: {user.get('is_active', 'Not set')}")
        else:
            print("\n❌ User 'Rajesh Kumar (President)' not found!")
            print("\nSearching for any user with position='president'...")
            cursor = users.find({"position": "president"})
            async for u in cursor:
                print(f"\n  Found: {u.get('name')}")
                print(f"    Phone: {u.get('phone')}")
                print(f"    Role: {u.get('role')}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
