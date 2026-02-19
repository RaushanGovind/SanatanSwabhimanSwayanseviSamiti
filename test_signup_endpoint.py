
import requests
import json

url = "http://127.0.0.1:8000/api/auth/signup"
data = {
    "name": "Test User",
    "phone": "9999999900",
    "email": "test@example.com",
    "password": "password123",
    "role": "family_head",
    "recommendation_token": None
}

try:
    print(f"Sending POST to {url}")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Also try GET /api/status
try:
    url_status = "http://127.0.0.1:8000/api/status"
    print(f"Sending GET to {url_status}")
    response = requests.get(url_status)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
