import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    uri = "mongodb+srv://MaaJagdambaSamiti:Raushan236@cluster0.rwxvzfk.mongodb.net/jagdamba_samiti?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client['MaaJagdambaSamiti']
    user = await db.users.find_one({'name': 'Manoj Verma'})
    print(f"MANOJ VERMA RECORD: {user}")
    
    if not user:
        # Try finding any user with position containing 'joint'
        import re
        jt_users = await db.users.find({'position': re.compile('joint', re.I)}).to_list(length=10)
        print(f"JOINT USERS: {jt_users}")
        
    fams = await db.families.find().to_list(length=100)
    print("\nALL FAMILIES:")
    for f in fams:
        print(f"Head: '{f.get('head_name')}' | Status: '{f.get('status')}' | ID: '{f.get('family_id')}'")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
