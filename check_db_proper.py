from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.jagdamba_samiti
    fam_count = await db.families.count_documents({})
    user_count = await db.users.count_documents({})
    print(f"Family count: {fam_count}")
    print(f"User count: {user_count}")
    
    if fam_count > 0:
        cursor = db.families.find({})
        async for fam in cursor:
            print(f"- {fam.get('head_name')} | Status: {fam.get('status')} | Stage: {fam.get('verification_stage')}")
            # Check form_data
            fd = fam.get("form_data")
            if fd:
                import json
                try:
                    data = json.loads(fd)
                    print(f"  Form Data Name: {data.get('head_details', {}).get('full_name')}")
                except:
                    print("  Form Data: (invalid JSON)")
            else:
                print("  Form Data: (empty)")

if __name__ == "__main__":
    asyncio.run(check_db())
