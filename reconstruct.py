
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

css_code = [
    '            <style>{`\n',
    '                .form-input { padding: 12px; }\n',
    '                .grid-layout { display: grid; gap: 20px; }\n',
    '                .two-col { grid-template-columns: 1fr 1fr; }\n',
    '            `}</style>\n'
]

# Insert before Footer
for i, line in enumerate(lines):
    if '<Footer />' in line:
        lines[i:i] = css_code
        break

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("CSS restored partially.")
