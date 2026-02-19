
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

start_marker = -1
end_marker = -1
for i, line in enumerate(lines):
    if '{step > 0 ? (' in line:
        start_marker = i + 1
    if '<Footer />' in line:
        end_marker = i
        break

if start_marker != -1 and end_marker != -1:
    lines[start_marker:end_marker] = [
        '                    <div>DUMMY STRUCTURE</div>',
        '                ) : null}',
        '            </div>'
    ]
    with open(filename, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"File simplified structural (lines {start_marker+1}-{end_marker}).")
