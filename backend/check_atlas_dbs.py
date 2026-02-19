import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    uri = "mongodb+srv://MaaJagdambaSamiti:Raushan236@cluster0.rwxvzfk.mongodb.net/jagdamba_samiti?retryWrites=true&w=majority&appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    dbs = await client.list_database_names()
    print(f"DATABASES: {dbs}")
    
    for db_name in dbs:
        db = client[db_name]
        colls = await db.list_collection_names()
        print(f"DB: {db_name} | Collections: {colls}")
        if 'families' in colls:
            count = await db.families.count_documents({})
            print(f"  -> families count: {count}")
            
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
