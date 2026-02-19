
import sys

def print_hex(filename, start, end):
    with open(filename, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')
    
    lines = content.split('\n')
    for i in range(start-1, min(end, len(lines))):
        line = lines[i]
        print(f"{i+1}: {line!r}")
        print(f"   {' '.join(hex(ord(c)) for c in line)}")

if __name__ == "__main__":
    print_hex(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
