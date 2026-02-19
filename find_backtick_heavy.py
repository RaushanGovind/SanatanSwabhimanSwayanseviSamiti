
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
counts = []
for i, line in enumerate(lines):
    counts.append((line.count('`'), i+1, line[:100]))

counts.sort(key=lambda x: x[0], reverse=True)
for c, l, snippet in counts[:10]:
    print(f"Line {l}: {c} backticks. Snippet: {snippet}")
