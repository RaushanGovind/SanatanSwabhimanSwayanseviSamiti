
import sys
import os

# Add the current directory to sys.path so we can import from main
sys.path.append(os.getcwd())

try:
    from main import app
    print("\n--- Route Dump ---")
    for route in app.routes:
        print(f"Path: {route.path}, Name: {route.name}, Methods: {route.methods}")
    print("------------------\n")
except Exception as e:
    print(f"Error dumping routes: {e}")
