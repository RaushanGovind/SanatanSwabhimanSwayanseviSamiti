
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

backtick_open = False
last_toggle_line = -1

lines = content.split('\n')
for i, line in enumerate(lines):
    for char in line:
        if char == '`':
            backtick_open = not backtick_open
            last_toggle_line = i + 1

if backtick_open:
    print(f"Backtick is UNCLOSED. Most recent toggle was on line {last_toggle_line}")
else:
    print("Backticks are balanced.")
