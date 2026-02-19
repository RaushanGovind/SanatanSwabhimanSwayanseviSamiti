
import re

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    # Find all slashes
    for match in re.finditer(r'/', line):
        pos = match.start()
        # Check if it's start of a tag </
        if pos > 0 and line[pos-1] == '<': continue
        # Check if it's end of a tag />
        if pos < len(line)-1 and line[pos+1] == '>': continue
        # Check if it's in a comment //
        if pos < len(line)-1 and line[pos+1] == '/': continue
        if pos > 0 and line[pos-1] == '/': continue
        # Check if it's in a string (very simple check)
        if line.count('"', 0, pos) % 2 == 1: continue
        if line.count("'", 0, pos) % 2 == 1: continue
        if line.count("`", 0, pos) % 2 == 1: continue
        
        # If it reaches here, it might be a regex or a division or a stray slash
        print(f"Line {i+1} at {pos}: {line.strip()}")
