import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

async def run():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DB_NAME")]
    f = await db.families.find_one()
    print("KEYS:", f.keys())
    print("HEAD_NAME:", f.get("head_name"))
    print("STATUS:", f.get("status"))
    print("FORM_DATA_TYPE:", type(f.get("form_data")))

if __name__ == "__main__":
    asyncio.run(run())
