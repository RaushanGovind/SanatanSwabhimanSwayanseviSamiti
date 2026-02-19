
from main import app
import sys

print("Dumping routes:")
for route in app.routes:
    print(route.path)
