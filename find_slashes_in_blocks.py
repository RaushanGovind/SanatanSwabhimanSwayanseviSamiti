
import re

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all { ... } blocks
blocks = re.findall(r'\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}', content)
for block in blocks:
    if '/' in block:
        # Check if it's a comment or a string
        if '//' in block or '/*' in block:
            print(f"Comment with slash in block: {block[:50]}...")
        elif '"' in block or "'" in block or '`' in block:
            print(f"String with slash in block: {block[:50]}...")
        else:
            print(f"SUSPICIOUS SLASH in block: {block}")
