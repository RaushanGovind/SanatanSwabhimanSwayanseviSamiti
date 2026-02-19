

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password, salt)
    return hashed.decode('utf-8')

async def reset_pass():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME")
    
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    print(f"Connected to {db_name}")
    
    # access 7700000003 (Amit Sharma)
    phone = "7700000003"
    new_pass = "secretary123"
    hashed = get_password_hash(new_pass)
    
    result = await db.users.update_one(
        {"phone": phone},
        {"$set": {"hashed_password": hashed}}
    )
    
    if result.matched_count:
        print(f"Password for {phone} (Secretary) reset to '{new_pass}'")
    else:
        print(f"User {phone} not found!")

if __name__ == "__main__":
    asyncio.run(reset_pass())
