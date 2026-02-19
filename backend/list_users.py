import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['jagdamba_samiti']
    users = await db.users.find().to_list(length=100)
    print("ALL USERS:")
    for u in users:
        print(f"Name: '{u.get('name')}' | Role: '{u.get('role')}' | Position: '{u.get('position')}' | Phone: '{u.get('phone')}'")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
