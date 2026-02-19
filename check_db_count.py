from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.jagdama_samiti
    fam_count = await db.families.count_documents({})
    user_count = await db.users.count_documents({})
    print(f"Family count: {fam_count}")
    print(f"User count: {user_count}")
    
    if fam_count > 0:
        fam = await db.families.find_one()
        print(f"Sample family head: {fam.get('head_name')}")
        print(f"Sample family status: {fam.get('status')}")
        print(f"Sample family coordinator_id: {fam.get('coordinator_id')}")

if __name__ == "__main__":
    asyncio.run(check_db())
