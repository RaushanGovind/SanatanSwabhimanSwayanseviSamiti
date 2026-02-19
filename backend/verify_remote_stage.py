"""
Verify the status of 'Raushan Kumar Jha' in the remote database
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

MONGO_URI = "mongodb+srv://MaaJagdambaSamiti:Raushan236@cluster0.rwxvzfk.mongodb.net/jagdamba_samiti?retryWrites=true&w=majority&appName=Cluster0"  # From .env
DATABASE_NAME = "MaaJagdambaSamiti"  # From .env

async def verify_remote():
    try:
        print(f"Connecting to remote database '{DATABASE_NAME}'...")
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DATABASE_NAME]
        families_collection = db["families"]
        
        # Check for Raushan Kumar Jha
        raushan = await families_collection.find_one({"head_name": "Raushan Kumar Jha"})
        if raushan:
            print(f"Found Raushan Kumar Jha!")
            print(f"Stage: {raushan.get('verification_stage')}")
            print(f"Coordinator: {raushan.get('coordinator_name', 'Not Assigned')}")
        else:
            print("Raushan Kumar Jha NOT found.")
            
        client.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_remote())
