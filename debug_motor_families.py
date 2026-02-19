
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

# Replicate backend path logic
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print(f"Connecting to {DB_NAME} at {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else 'local'}...")

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        families_collection = db["families"]
        
        count = await families_collection.count_documents({})
        print(f"Total Families (Motor): {count}")
        
        # Simulating get_all_families
        query = {}
        # Simulation of projection from families.py
        projection = {"form_data": 1, "status": 1, "verification_stage": 1, "coordinator_name": 1, "coordinator_id": 1, "head_name": 1, "family_id": 1, "remarks": 1, "recommender_name": 1, "join_method": 1}
        
        cursor = families_collection.find(query, projection)
        results = []
        async for f in cursor:
            try:
                form_data = f.get("form_data")
                if form_data and isinstance(form_data, str):
                    try:
                        data = json.loads(form_data)
                    except:
                        data = {}
                elif isinstance(form_data, dict):
                    data = form_data
                else:
                    data = {}
                
                # Logic from families.py
                if "head_details" not in data:
                    data["head_details"] = {"full_name": f.get("head_name")}
                
                data["_id"] = str(f.get("_id"))
                results.append(data)
            except Exception as e:
                print(f"Error processing family {f.get('_id')}: {e}")

        print(f"Successfully processed {len(results)} families via Motor logic.")
        if len(results) > 0:
            print(f"Sample: {results[0].get('head_details', {}).get('full_name')}")
            
    except Exception as e:
        print(f"Motor Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
