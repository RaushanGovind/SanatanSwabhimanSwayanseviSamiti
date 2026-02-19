
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

MONGO_URI = "mongodb+srv://doadmin:48X02195vIA6d7pT@db-mongodb-blr1-84094-c146d299.mongo.ondigitalocean.com/admin?tls=true&authSource=admin"
DB_NAME = "MaaJagdambaSamiti"

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        families = db.families
        
        # search for Naveen
        fam = await families.find_one({"head_name": "NAVEEN KUMAR"})
        if fam:
            print(f"ID: {str(fam['_id'])}")
            print(f"Stage: {fam.get('verification_stage')}")
        else:
            print("Not found")
            
    except Exception as e:
        print(e)

if __name__ == "__main__":
    asyncio.run(main())
