
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Clean up lines 1528 to 1538
for i in range(1525, 1540):
    if i < len(lines):
        lines[i] = lines[i].strip() + '\n'

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Removed all indentation from lines 1525-1540.")
