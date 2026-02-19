
import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack.append(('{', i + 1, j + 1))
            elif char == '}':
                if not stack or stack[-1][0] != '{':
                    print(f"Mismatch/Extra closing brace '}}' at line {i+1}, col {j+1}")
                    return
                stack.pop()
            elif char == '(':
                stack.append(('(', i + 1, j + 1))
            elif char == ')':
                if not stack or stack[-1][0] != '(':
                    print(f"Mismatch/Extra closing paren ')' at line {i+1}, col {j+1}")
                    return
                stack.pop()
    
    if stack:
        for s in stack:
            print(f"Unclosed '{s[0]}' at line {s[1]}, col {s[2]}")
    else:
        print("All matched!")

if __name__ == "__main__":
    check_balance(sys.argv[1])
