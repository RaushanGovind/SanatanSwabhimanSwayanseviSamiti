
# Script to insert the pending-registrations tab into AdminDashboard.jsx

import os

dashboard_file = r"e:\Jagdama Samiti\frontend\src\pages\AdminDashboard.jsx"
pending_tab_file = r"e:\Jagdama Samiti\pending_tab_content.txt"

# Read the pending tab content
with open(pending_tab_file, 'r', encoding='utf-8') as f:
    pending_content = f.read()

# Read the dashboard file
with open(dashboard_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "activeTab === 'families'" (around line 933)
insert_index = None
for i, line in enumerate(lines):
    if "activeTab === 'families'" in line and "&&" in line:
        insert_index = i
        break

if insert_index is None:
    print("❌ Could not find the insertion point!")
    exit(1)

print(f"✅ Found insertion point at line {insert_index + 1}")

# Insert the pending tab content before the families tab
lines.insert(insert_index, pending_content)

# Write back to the file
with open(dashboard_file, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"✅ Successfully inserted pending-registrations tab!")
print(f"📝 Inserted at line {insert_index + 1}")
print(f"📄 Total lines now: {len(lines)}")
