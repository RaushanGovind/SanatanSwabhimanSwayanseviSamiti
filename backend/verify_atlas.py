import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "jagdamba_samiti")

async def verify():
    print(f"Connecting to: {MONGO_URI.split('@')[-1]}") # Hide credentials
    client = AsyncIOMotorClient(MONGO_URI)
    try:
        # Ping the server
        await client.admin.command('ping')
        print("Connected successfully!")
        
        db_names = await client.list_database_names()
        print(f"Databases: {db_names}")
        
        db = client[DB_NAME]
        collections = await db.list_collection_names()
        print(f"Collections in '{DB_NAME}': {collections}")
        
        if "users" in collections:
            count = await db.users.count_documents({})
            print(f"User count: {count}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
