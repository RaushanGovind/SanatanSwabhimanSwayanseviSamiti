
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace Step 4 (lines 1481 to 1531) with dummy
lines[1480:1531] = ['                            {step === 4 && (<div>Step 4</div>)}\n']

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Step 4 replaced with dummy.")
