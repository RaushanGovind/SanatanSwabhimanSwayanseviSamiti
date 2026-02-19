import requests
import json

API_URL = "http://127.0.0.1:8000/api"

print("=" * 70)
print("TESTING COMPLETE FRONTEND FLOW")
print("=" * 70)

# Step 1: Login
print("\n1. Testing Login...")
login_data = {
    "phone": "7700000001",
    "password": "rajesh123"
}

try:
    response = requests.post(f"{API_URL}/auth/login", json=login_data)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"   ✅ Login successful!")
        print(f"   Token: {token[:50]}...")
        
        # Step 2: Get Families with token
        print("\n2. Testing GET /api/families with token...")
        headers = {"Authorization": f"Bearer {token}"}
        
        families_response = requests.get(f"{API_URL}/families", headers=headers)
        print(f"   Status: {families_response.status_code}")
        
        if families_response.status_code == 200:
            families = families_response.json()
            print(f"   ✅ SUCCESS! Received {len(families)} families")
            
            # Count pending
            pending = [f for f in families if f.get('status') == 'Pending']
            print(f"   📊 Pending families: {len(pending)}")
            
            if pending:
                print(f"\n   Pending applications:")
                for p in pending:
                    print(f"     - {p.get('head_name', 'N/A')} ({p.get('verification_stage', 'N/A')})")
        else:
            print(f"   ❌ FAILED!")
            print(f"   Response: {families_response.text}")
            
    else:
        print(f"   ❌ Login failed!")
        print(f"   Response: {response.text}")
        
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 70)
print("DIAGNOSIS:")
print("=" * 70)

print("""
If login works but families fails:
- Check if Rajesh has committee permissions
- Check backend logs for errors

If both work:
- Frontend issue: Clear browser localStorage
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

If login fails:
- Password might be wrong
- Run: python set_rajesh_password.py
""")
