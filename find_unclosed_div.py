
import re

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Very simple tag tracker
stack = []
# Match <div or </div>
tags = re.finditer(r'<(div|/div)', content)

for match in tags:
    tag = match.group(0)
    line_no = content.count('\n', 0, match.start()) + 1
    if tag == '<div':
        stack.append(line_no)
    else:
        if not stack:
            print(f"Extra </div> at line {line_no}")
        else:
            stack.pop()

if stack:
    for s in stack:
        print(f"Unclosed <div at line {s}")
