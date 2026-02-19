
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Explicitly load from backend/.env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

def check_coordinators():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("--- Checking for Committee Members / Coordinators ---")
    
    # Roles/Positions to look for
    roles = ['coordinator', 'president', 'vice_president', 'secretary', 'treasurer', 'executive_member']
    
    query = {
        "$or": [
            {"role": {"$in": roles}},
            {"position": {"$in": roles}}
        ]
    }
    
    users = list(db.users.find(query))
    print(f"Total potential committee members found: {len(users)}")
    
    for user in users:
        print(f"User: {user.get('name')} | Role: {user.get('role')} | Position: {user.get('position')}")

    print("\n--- Checking specifically for 'coordinator' ---")
    coords = list(db.users.find({"$or": [{"role": "coordinator"}, {"position": "coordinator"}]}))
    print(f"Total Coordinators found: {len(coords)}")
    for c in coords:
         print(f"Coordinator: {c.get('name')} | ID: {c.get('_id')}")

if __name__ == "__main__":
    check_coordinators()
