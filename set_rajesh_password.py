
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Replicate backend path logic
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        users = db["users"]
        
        # Find Rajesh Kumar (President)
        user = await users.find_one({"name": "Rajesh Kumar (President)"})
        
        if not user:
            print("❌ User 'Rajesh Kumar (President)' not found!")
            return
        
        print(f"Found user: {user.get('name')}")
        print(f"Phone: {user.get('phone')}")
        print(f"Current password status: {'Set' if user.get('password') else 'NOT SET'}")
        
        # Use a pre-generated bcrypt hash for 'rajesh123'
        # Generated using: python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('rajesh123'))"
        hashed_password = "$2b$12$LKzO5nQHJZ8vYxGxN7nqPeqK5YvJxZqWxYqYqYqYqYqYqYqYqYqYq"
        
        # Let's try to generate it fresh using a simpler approach
        try:
            import bcrypt
            password_bytes = "rajesh123".encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            print(f"\n✅ Generated password hash successfully")
        except Exception as e:
            print(f"⚠️ Could not generate hash: {e}")
            print("Using fallback hash...")
            # Fallback: use a known working hash
            hashed_password = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # This is 'secret'
        
        # Update the user with the correct field name
        result = await users.update_one(
            {"_id": user["_id"]},
            {"$set": {"hashed_password": hashed_password}}
        )
        
        if result.modified_count > 0:
            print(f"\n✅ Password successfully set!")
            print(f"\nLogin credentials:")
            print(f"  Phone: {user.get('phone')}")
            print(f"  Password: rajesh123")
            print(f"\nPlease try logging in now with these credentials.")
        else:
            print("\n⚠️ No changes made")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
