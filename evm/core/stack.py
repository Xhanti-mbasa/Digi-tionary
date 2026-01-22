from evm.constants.limits import MAX_STACK_SIZE

class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        # EVM values must be within 256-bit range (0 to 2^256 - 1)
        if len(self.items) >= MAX_STACK_SIZE:
            raise Exception("Stack overflow")
        self.items.append(value)

    def pop(self):
        if len(self.items) == 0:
            raise Exception("Stack underflow")
        return self.items.pop()

    def __str__(self):
        if not self.items:
            return "<Empty Stack>"
        # Show top of stack at the top of the printout
        return "\n".join(
            f"{val}{' <top' if i == 0 else ''}" 
            for i, val in enumerate(reversed(self.items))
        )
