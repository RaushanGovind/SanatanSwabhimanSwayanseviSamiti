
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from collections import Counter

# Replicate backend path logic
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

print("=" * 70)
print("PENDING FAMILY REGISTRATION REQUESTS - STATUS REPORT")
print("=" * 70)

async def main():
    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        families = db["families"]
        
        # Get all families
        total_count = await families.count_documents({})
        print(f"\n📊 TOTAL FAMILIES IN DATABASE: {total_count}")
        
        # Get pending families
        pending_count = await families.count_documents({"status": "Pending"})
        print(f"\n⏳ PENDING REGISTRATION REQUESTS: {pending_count}")
        
        # Get approved families
        approved_count = await families.count_documents({"status": "Approved"})
        print(f"✅ APPROVED FAMILIES: {approved_count}")
        
        # Get rejected families
        rejected_count = await families.count_documents({"status": "Rejected"})
        print(f"❌ REJECTED FAMILIES: {rejected_count}")
        
        # Get profile incomplete
        incomplete_count = await families.count_documents({"status": "Profile Incomplete"})
        print(f"📝 PROFILE INCOMPLETE: {incomplete_count}")
        
        print("\n" + "-" * 70)
        print("PENDING REQUESTS BREAKDOWN BY VERIFICATION STAGE:")
        print("-" * 70)
        
        # Get pending families with their stages
        cursor = families.find({"status": "Pending"}, {"verification_stage": 1, "head_name": 1, "join_method": 1})
        
        stage_counts = Counter()
        pending_list = []
        
        async for fam in cursor:
            stage = fam.get("verification_stage", "Unknown")
            stage_counts[stage] += 1
            pending_list.append({
                "id": str(fam.get("_id", "")),
                "name": fam.get("head_name", "N/A"),
                "stage": stage,
                "method": fam.get("join_method", "Direct")
            })
        
        # Display stage breakdown
        for stage, count in sorted(stage_counts.items()):
            icon = "👤" if "Recommender" in stage else "👑" if "President" in stage else "📋" if "Secretary" in stage else "🔍" if "Coordinator" in stage else "📄"
            print(f"\n{icon} {stage}: {count} application(s)")
        
        # Show details of pending applications
        if pending_list:
            print("\n" + "-" * 70)
            print("DETAILED LIST OF PENDING APPLICATIONS:")
            print("-" * 70)
            for i, app in enumerate(pending_list, 1):
                print(f"\n{i}. {app['name']}")
                print(f"   ID: {app['id']}")
                print(f"   Stage: {app['stage']}")
                print(f"   Method: {app['method']}")
        
        # President-specific view
        print("\n" + "=" * 70)
        print("PRESIDENT'S ACTION REQUIRED:")
        print("=" * 70)
        
        president_scrutiny = await families.count_documents({
            "status": "Pending",
            "verification_stage": "President Scrutiny"
        })
        
        president_approval = await families.count_documents({
            "status": "Pending",
            "verification_stage": "President Approval"
        })
        
        print(f"\n🔍 Applications at PRESIDENT SCRUTINY (Initial Review): {president_scrutiny}")
        print(f"✅ Applications at PRESIDENT APPROVAL (Final Approval): {president_approval}")
        print(f"\n📌 TOTAL REQUIRING PRESIDENT ACTION: {president_scrutiny + president_approval}")
        
        print("\n" + "=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
