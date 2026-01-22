import sys
import os

# This line allows you to run the script from the root folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from evm.core.stack import Stack

def main():
    s = Stack()
    print("Pushing 2, 4, 1...")
    s.push(2)
    s.push(4)
    s.push(1)
    
    print("Current Stack:")
    print(s)
    
    print(f"\nPopped value: {s.pop()}")
    
    print("\nStack after pop:")
    print(s)

if __name__ == "__main__":
    main()
