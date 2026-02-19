import requests
import json

API_URL = "http://127.0.0.1:8000/api"

print("=" * 70)
print("TESTING VERIFY-STAGE ENDPOINT")
print("=" * 70)

# Step 1: Login as Rajesh
print("\n1. Logging in as Rajesh...")
login_data = {
    "phone": "7700000001",
    "password": "rajesh123"
}

response = requests.post(f"{API_URL}/auth/login", json=login_data)
if response.status_code != 200:
    print(f"❌ Login failed: {response.text}")
    exit(1)

token = response.json().get("access_token")
print(f"✅ Login successful! Token: {token[:30]}...")

headers = {"Authorization": f"Bearer {token}"}

# Step 2: Get pending families
print("\n2. Getting pending families...")
families_response = requests.get(f"{API_URL}/families", headers=headers)
if families_response.status_code != 200:
    print(f"❌ Failed to get families: {families_response.text}")
    exit(1)

families = families_response.json()
pending = [f for f in families if f.get('status') == 'Pending']
print(f"✅ Found {len(pending)} pending families")

if not pending:
    print("❌ No pending families to test with!")
    exit(1)

# Get the first pending family
test_family = pending[0]
family_id = test_family.get('_id')
print(f"\n3. Testing with family: {test_family.get('head_name', 'N/A')}")
print(f"   ID: {family_id}")
print(f"   Stage: {test_family.get('verification_stage', 'N/A')}")

# Step 3: Try to verify the stage
print(f"\n4. Attempting to verify stage...")
verify_data = {
    "current_stage": test_family.get('verification_stage'),
    "has_coordinator": bool(test_family.get('coordinator_id'))
}

verify_response = requests.post(
    f"{API_URL}/families/{family_id}/verify-stage",
    json=verify_data,
    headers=headers
)

print(f"   Status Code: {verify_response.status_code}")
print(f"   Response: {verify_response.text}")

if verify_response.status_code == 200:
    print("\n✅ SUCCESS! Verification worked!")
    print(json.dumps(verify_response.json(), indent=2))
else:
    print(f"\n❌ FAILED! Error details:")
    try:
        error = verify_response.json()
        print(f"   Detail: {error.get('detail', 'Unknown error')}")
    except:
        print(f"   Raw response: {verify_response.text}")

print("\n" + "=" * 70)
