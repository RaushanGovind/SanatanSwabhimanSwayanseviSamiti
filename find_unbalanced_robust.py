
import sys

filename = 'e:/Jagdama Samiti/frontend/src/pages/RegisterFamily.jsx'
with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

def find_unbalanced(text):
    stack = []
    # (char, line, col, type)
    line = 1
    col = 1
    in_string = None # ", ', `
    in_comment = None # //, /*
    
    i = 0
    while i < len(text):
        c = text[i]
        
        if c == '\n':
            line += 1
            col = 1
            if in_comment == '//':
                in_comment = None
            i += 1
            continue
            
        if in_comment:
            if in_comment == '/*' and text[i:i+2] == '*/':
                in_comment = None
                i += 2
                col += 2
                continue
            i += 1
            col += 1
            continue
            
        if in_string:
            if c == '\\':
                i += 2
                col += 2
                continue
            if c == in_string:
                in_string = None
            i += 1
            col += 1
            continue
            
        # Not in string or comment
        if text[i:i+2] == '//':
            in_comment = '//'
            i += 2
            col += 2
            continue
        if text[i:i+2] == '/*':
            in_comment = '/*'
            i += 2
            col += 2
            continue
            
        if c in ['"', "'", "`"]:
            in_string = c
            i += 1
            col += 1
            continue
            
        if c in ['{', '(', '[']:
            stack.append((c, line, col))
        elif c == '}':
            if not stack or stack[-1][0] != '{':
                print(f"Mismatch: found '}}' at {line}:{col}")
                if stack: print(f"  Expected match for '{stack[-1][0]}' from {stack[-1][1]}:{stack[-1][2]}")
                return
            stack.pop()
        elif c == ')':
            if not stack or stack[-1][0] != '(':
                print(f"Mismatch: found ')' at {line}:{col}")
                if stack: print(f"  Expected match for '{stack[-1][0]}' from {stack[-1][1]}:{stack[-1][2]}")
                return
            stack.pop()
        elif c == ']':
            if not stack or stack[-1][0] != '[':
                print(f"Mismatch: found ']' at {line}:{col}")
                if stack: print(f"  Expected match for '{stack[-1][0]}' from {stack[-1][1]}:{stack[-1][2]}")
                return
            stack.pop()
            
        i += 1
        col += 1
        
    if in_string:
        print(f"Unclosed string {in_string} starting somewhere before end.")
    if in_comment == '/*':
        print(f"Unclosed multi-line comment starting somewhere before end.")
    if stack:
        for char, l, cl in stack:
            print(f"Unclosed '{char}' from {l}:{cl}")
    else:
        print("All balanced (ignoring JSX tags for now)!")

find_unbalanced(content)
