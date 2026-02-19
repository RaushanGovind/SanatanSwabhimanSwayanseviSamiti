
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

step3_start = -1
for i, line in enumerate(lines):
    if '{step === 3 && (' in line:
        step3_start = i
        break

if step3_start != -1:
    # Look for the next step or the end of form-card
    # Step 3 actually ended around 1478
    # We'll just search for STEP 4 comment
    step4_start = -1
    for i in range(step3_start, len(lines)):
        if 'STEP 4' in lines[i]:
            step4_start = i
            break
    
    if step4_start != -1:
        # Step 3 ends just before step 4
        # We need to find the last )} before step 4
        for i in range(step4_start, step3_start, -1):
            if ')}' in lines[i]:
                step3_end = i
                break
        
        lines[step3_start:step3_end+1] = ['                            {step === 3 && (<div>Step 3</div>)}']
        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"Step 3 (lines {step3_start+1}-{step3_end+1}) replaced properly.")
