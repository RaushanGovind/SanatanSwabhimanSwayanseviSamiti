from database import audit_logs_collection
import datetime
import json

async def log_action(user_id: str, action: str, target_type: str, target_id: str, details: dict = None):
    """
    Standard utility to record system actions into the audit log (MongoDB).
    """
    log_entry = {
        "user_id": user_id,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "details": details if details else {},
        "timestamp": datetime.datetime.utcnow()
    }
    await audit_logs_collection.insert_one(log_entry)
