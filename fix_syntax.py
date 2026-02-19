import re

# Read the file
with open('e:/Jagdama Samiti/frontend/src/pages/FamilyDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix problematic lines
fixed_lines = []
for i, line in enumerate(lines):
    # Replace literal backslash-r-backslash-n with nothing (they'll become actual line breaks)
    if '\\r\\n' in line:
        print(f"Line {i+1}: Found literal \\r\\n")
        line = line.replace('\\r\\n', ' ')
    fixed_lines.append(line)

# Write back
with open('e:/Jagdama Samiti/frontend/src/pages/FamilyDashboard.jsx', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("All literal \\r\\n sequences removed!")
