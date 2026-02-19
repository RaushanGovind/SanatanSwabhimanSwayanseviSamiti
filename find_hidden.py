
import re

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    # Ignore lines with http:// or https:// if they look like strings
    clean_line = line.replace('http://', 'http:__').replace('https://', 'https:__')
    if '//' in clean_line:
        comment = clean_line.split('//')[1]
        if '{' in comment:
            print(f"Line {i+1} has open brace in comment: {line.strip()}")
        if '}' in comment:
            print(f"Line {i+1} has close brace in comment: {line.strip()}")
        if '(' in comment:
             print(f"Line {i+1} has open paren in comment: {line.strip()}")
        if ')' in comment:
             print(f"Line {i+1} has close paren in comment: {line.strip()}")

# Multi-line comments
for match in re.finditer(r'/\*.*?\*/', content, re.DOTALL):
    text = match.group(0)
    if '{' in text or '}' in text or '(' in text or ')' in text:
        line_no = content.count('\n', 0, match.start()) + 1
        print(f"Multi-line comment starting at {line_no} has braces/parens")
