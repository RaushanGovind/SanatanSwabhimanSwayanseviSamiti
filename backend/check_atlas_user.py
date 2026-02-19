import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    uri = "mongodb+srv://MaaJagdambaSamiti:Raushan236@cluster0.rwxvzfk.mongodb.net/jagdamba_samiti?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client['MaaJagdambaSamiti']
    
    import re
    users = await db.users.find({'$or': [
        {'name': re.compile('manoj', re.I)},
        {'position': re.compile('joint', re.I)}
    ]}).to_list(length=100)
    
    print("MATCHING USERS:")
    for u in users:
        print(f"ID: {u['_id']} | Name: '{u.get('name')}' | Role: '{u.get('role')}' | Position: '{u.get('position')}' | Phone: '{u.get('phone')}'")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
