
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Add an extra </div> after line 1535 (index 1534)
lines.insert(1535, '            </div>\n')

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Added an extra </div> to fix tag balance.")
