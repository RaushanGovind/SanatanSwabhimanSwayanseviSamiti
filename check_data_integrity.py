
import asyncio
from backend.database import families_collection, get_database
import json

async def check_bad_data():
    db = await get_database()
    count = await families_collection.count_documents({})
    print(f"Total families: {count}")
    
    bad_count = 0
    async for fam in families_collection.find({}):
        fd = fam.get("form_data")
        if fd is None:
            print(f"Family {fam.get('_id')} has NULL form_data")
            bad_count += 1
            continue
            
        data = None
        try:
            if isinstance(fd, str):
                data = json.loads(fd)
            else:
                data = fd
        except:
            print(f"Family {fam.get('_id')} has INVALID JSON form_data")
            bad_count += 1
            continue
            
        if data is None:
             print(f"Family {fam.get('_id')} resulted in None data")
             bad_count += 1

    print(f"Found {bad_count} potentially problematic records.")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_bad_data())
