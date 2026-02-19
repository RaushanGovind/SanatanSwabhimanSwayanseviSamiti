import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_user():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['jagdama_samiti']
    user = await db.users.find_one({'name': 'Manoj Verma'})
    print(f"USER RECORD: {user}")
    
    all_fams = await db.families.find().to_list(length=100)
    print(f"TOTAL FAMILIES IN DB: {len(all_fams)}")
    for f in all_fams:
        print(f"FAM: {f.get('head_name')} | Status: {f.get('status')} | Stage: {f.get('verification_stage')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_user())
