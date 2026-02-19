
import requests
import json
import sys

BASE_URL = "http://localhost:8001/api"

def main():
    # 1. Login
    print("Logging in as Rajesh...")
    try:
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "phone": "7700000001",
            "password": "rajesh123",
            "role": "admin"
        })
        
        if login_res.status_code != 200:
            print(f"Login failed: {login_res.status_code} {login_res.text}")
            return
            
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login success!")
        
        # 2. Get Naveen's ID (hardcoded from previous step 6991d206087476b8c7e978a7)
        # Or fetch dynamically if needed, but let's use the one found.
        # Check if ID is likely valid
        
        # We can also fetch pending families to be sure
        fam_res = requests.get(f"{BASE_URL}/families", headers=headers)
        families = fam_res.json()
        naveen = next((f for f in families if f["head_name"] == "NAVEEN KUMAR"), None)
        
        if not naveen:
            # Maybe it's not visible to this user? But President should see it.
            # Use Check Pending Requests script proved it exists.
            # But the endpoint /families filters by user.
            # Wait, get_all_families filters?
            # get_all_families checks role. Admin sees all.
            # Let's try to verify directly using ID found before.
            fam_id = "6991d206087476b8c7e978a7" # From step 208 output for NAVEEN KUMAR
        else:
            fam_id = naveen["_id"]
            
        print(f"Verifying Family ID: {fam_id}")
        
        # 3. Verify
        payload = {
            "remarks": "Test Verification via Script",
            "current_stage": "President Scrutiny"
        }
        
        verify_res = requests.post(
            f"{BASE_URL}/families/{fam_id}/verify-stage",
            json=payload,
            headers=headers
        )
        
        print(f"Status Code: {verify_res.status_code}")
        print(f"Response: {verify_res.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
