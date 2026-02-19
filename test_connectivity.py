
import requests
import time

urls = [
    "http://127.0.0.1:8000/api/status",
    "http://localhost:8000/api/status",
    "http://127.0.0.1:8000/api/auth/signup"
]

for url in urls:
    try:
        print(f"Testing {url}...")
        if "signup" in url:
            response = requests.post(url, json={
                "name": "Test User",
                "phone": "8888888888",
                "role": "family_head",
                "password": "password",
                "email": "test@test.com"
            })
        else:
            response = requests.get(url)
            
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Error connecting to {url}: {e}")
    print("-" * 20)
