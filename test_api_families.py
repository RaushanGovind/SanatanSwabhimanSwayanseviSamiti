
import requests
import json

# Test the /api/families endpoint with correct credentials
API_URL = "http://127.0.0.1:8000/api"

# Correct credentials for Rajesh Kumar (President)
login_data = {
    "phone": "7700000001",  # Correct phone number
    "password": "rajesh123"
}

print("=" * 60)
print("TESTING /api/families ENDPOINT WITH CORRECT CREDENTIALS")
print("=" * 60)

try:
    # Step 1: Login
    print("\n1. Attempting login with phone: 7700000001...")
    login_response = requests.post(f"{API_URL}/auth/login", json=login_data)
    print(f"   Status Code: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        token = token_data.get("access_token")
        print(f"   ✅ Login successful! Token: {token[:20]}...")
        
        # Step 2: Get user info
        print("\n2. Getting current user info...")
        headers = {"Authorization": f"Bearer {token}"}
        me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        print(f"   Status Code: {me_response.status_code}")
        
        if me_response.status_code == 200:
            user_info = me_response.json()
            print(f"   ✅ User: {user_info.get('name')}")
            print(f"      Role: {user_info.get('role')}")
            print(f"      Position: {user_info.get('position')}")
            print(f"      Is Active: {user_info.get('is_active')}")
        
        # Step 3: Call /api/families
        print("\n3. Calling /api/families...")
        families_response = requests.get(f"{API_URL}/families", headers=headers)
        print(f"   Status Code: {families_response.status_code}")
        
        if families_response.status_code == 200:
            families_data = families_response.json()
            print(f"   ✅ SUCCESS! Received {len(families_data)} families")
            if len(families_data) > 0:
                print(f"\n   Sample families:")
                for i, fam in enumerate(families_data[:5]):
                    print(f"     {i+1}. {fam.get('head_name', fam.get('head_details', {}).get('full_name', 'N/A'))} - Status: {fam.get('status')}")
            else:
                print("   ⚠️ WARNING: Empty array returned despite 222 families in DB!")
        else:
            print(f"   ✗ FAILED!")
            print(f"   Response: {families_response.text[:500]}")
    else:
        print(f"   ✗ Login failed!")
        print(f"   Response: {login_response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n✗ ERROR: Cannot connect to backend at http://127.0.0.1:8000")
    print("   Make sure the backend server is running!")
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("\nNEXT STEPS:")
print("1. Open your browser and go to http://localhost:5173")
print("2. Log in with:")
print("   Phone: 7700000001")
print("   Password: rajesh123")
print("3. Navigate to Family Directory")
print("4. You should now see all 222 families!")
print("=" * 60)
