
import sys
import os
from fastapi.routing import APIRoute

# Add the current directory to sys.path so we can import from main
sys.path.append(os.getcwd())

try:
    from main import app
    print("\n--- Route Dump (Robust) ---")
    found_signup = False
    for route in app.routes:
        if isinstance(route, APIRoute):
            print(f"Path: {route.path}, Name: {route.name}, Methods: {route.methods}")
            if route.path == "/api/auth/signup":
                found_signup = True
        else:
            print(f"Mount/Other: Path={route.path}, Name={route.name}")
            
    if found_signup:
        print("\nSUCCESS: /api/auth/signup FOUND!")
    else:
        print("\nFAILURE: /api/auth/signup NOT FOUND!")
        
    print("------------------\n")
except Exception as e:
    print(f"Error dumping routes: {e}")
