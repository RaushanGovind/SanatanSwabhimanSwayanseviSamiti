from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, families, core, finance, management, elections, governance
from database import db, users_collection, families_collection, rules_collection
from utils.security import get_password_hash
import json
import datetime
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

app = FastAPI(title="Sanatan Swabhiman Swayamsevi Samiti API")

# Configure CORS
from fastapi.staticfiles import StaticFiles
import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(families.router, prefix="/api/families", tags=["families"])
app.include_router(core.router, prefix="/api", tags=["core"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(management.router, prefix="/api/management", tags=["management"])
app.include_router(elections.router, prefix="/api/elections", tags=["elections"])
app.include_router(governance.router, prefix="/api/governance", tags=["governance"])

@app.on_event("startup")
async def on_startup():
    try:
        # Auto-seed Admin
        admin_exists = await users_collection.find_one({"phone": "9999999999"})
        if not admin_exists:
            print("Seeding Admin User...")
            admin = {
                "name": "System Admin", 
                "phone": "9999999999", 
                "role": "admin", 
                "hashed_password": get_password_hash("admin123"),
                "is_active": True,
                "created_at": datetime.datetime.utcnow()
            }
            await users_collection.insert_one(admin)
            print("Admin Seeded: 9999999999 / admin123")

        # Auto-seed Rules from local text file
        if await rules_collection.count_documents({}) == 0:
            print("Seeding Initial Rules from file...")
            try:
                import re

                file_path = os.path.join(os.path.dirname(__file__), "Sanatan Swabhiman Swayamsevi Samiti, Satghara.txt")

                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        raw_lines = f.readlines()
                    
                    # Basic Markdown Formatting
                    formatted_lines = []
                    for line in raw_lines:
                        # Convert "1.1 Title" to "### 1.1 Title"
                        # But ensure we don't break "Chapter" lines which are handled by frontend
                        if not re.match(r'^(Chapter|अध्याय)', line.strip(), re.IGNORECASE):
                            line = re.sub(r'^\s*(\d+(\.\d+)+)\s+(.*)', r'### \1 \3', line)
                            
                        formatted_lines.append(line)
                    
                    rule_text = "".join(formatted_lines)

                    initial_rule = {
                        "content": {
                            "text_hi": rule_text,
                            "text": rule_text,
                            "text_en": "" 
                        },
                        "updated_at": datetime.datetime.utcnow()
                    }
                    await rules_collection.insert_one(initial_rule)
                    print("Rules seeded successfully from text file.")
                else:
                    print(f"Rules file not found at: {file_path}")
            except Exception as e:
                print(f"Error seeding rules: {e}")

    except Exception as e:
        print(f"Error seeding data: {e}")

    print("MongoDB Database Initialized!")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sanatan Swabhiman API (MongoDB Version)"}

@app.get("/api/status")
def get_status():
    return {"status": "running", "service": "Sanatan Swabhiman Backend (MongoDB)"}

# --- Database-backed Rules Implementation ---

from models.schemas import RuleUpdate

@app.get("/api/rules")
async def get_rules():
    # Fetch all rules ordered by latest first
    cursor = rules_collection.find().sort("updated_at", -1)
    rules = await cursor.to_list(length=100)
    
    if not rules:
        return {"current": {"text_hi": "", "text_en": "", "text": "", "structured": [], "updated_at": datetime.datetime.now().isoformat()}, "history": []}
    
    current_rule = rules[0]
    history = []
    
    def parse_content(content):
        if isinstance(content, dict):
            return content
        try:
            return json.loads(content)
        except:
            return {"text": content}

    current_data = parse_content(current_rule.get("content"))
    current_data["updated_at"] = current_rule.get("updated_at").isoformat() if isinstance(current_rule.get("updated_at"), datetime.datetime) else current_rule.get("updated_at")

    # The rest are history
    for r in rules[1:]:
        h_data = parse_content(r.get("content"))
        h_data["updated_at"] = r.get("updated_at").isoformat() if isinstance(r.get("updated_at"), datetime.datetime) else r.get("updated_at")
        history.append(h_data)
        
    return {
        "current": current_data,
        "history": history
    }

@app.post("/api/rules")
async def update_rules(update: RuleUpdate):
    content_dict = {}
    if update.text is not None: content_dict["text"] = update.text
    if update.text_hi is not None: content_dict["text_hi"] = update.text_hi
    if update.text_en is not None: content_dict["text_en"] = update.text_en
    if update.structured is not None: content_dict["structured"] = update.structured
    
    # Store as dictionary (better for Mongo)
    new_rule = {
        "content": content_dict,
        "updated_at": datetime.datetime.utcnow()
    }
    await rules_collection.insert_one(new_rule)
    
    return await get_rules()

if __name__ == "__main__":
    import uvicorn
    print("STARTING SERVER ON PORT 8001...")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
