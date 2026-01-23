from api.merkle_bridge import MerkleTree
import time

print("Adding words...")
root = MerkleTree.add_words(["alpha", "beta"])
print(f"Root: {root}")

print("Getting graph...")
graph = MerkleTree.get_graph()
print(f"Graph nodes: {len(graph['nodes'])}")

print("Done.")
