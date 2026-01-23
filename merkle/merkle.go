package main

import (
	"crypto/sha256"
	"encoding/hex"
)

// Node represents a node in the Merkle Tree
type Node struct {
	Hash  string
	Left  *Node
	Right *Node
	Data  string // Content for leaf nodes
}

// MerkleTree structure
type MerkleTree struct {
	Root   *Node
	Leaves []*Node
}

// NewNode creates a new node
func NewNode(left, right *Node, data string) *Node {
	node := &Node{}

	if left == nil && right == nil {
		hash := sha256.Sum256([]byte(data))
		node.Hash = hex.EncodeToString(hash[:])
		node.Data = data
	} else {
		prevHashes := []byte(left.Hash + right.Hash)
		hash := sha256.Sum256(prevHashes)
		node.Hash = hex.EncodeToString(hash[:])
		node.Left = left
		node.Right = right
	}

	return node
}

// NewMerkleTree creates a new Merkle Tree from a list of data strings
func NewMerkleTree(data []string) *MerkleTree {
	var nodes []*Node

	// If no data, return empty tree
	if len(data) == 0 {
		return &MerkleTree{}
	}

	// Create leaf nodes
	for _, datum := range data {
		nodes = append(nodes, NewNode(nil, nil, datum))
	}
	leaves := nodes

	// Build tree levels
	currentLevel := nodes
	for len(currentLevel) > 1 {
		var nextLevel []*Node
		
		for i := 0; i < len(currentLevel); i += 2 {
			if i+1 < len(currentLevel) {
				nextLevel = append(nextLevel, NewNode(currentLevel[i], currentLevel[i+1], ""))
			} else {
				// Duplicate the last node if odd number
				nextLevel = append(nextLevel, NewNode(currentLevel[i], currentLevel[i], ""))
			}
		}
		currentLevel = nextLevel
	}

	return &MerkleTree{
		Root:   currentLevel[0],
		Leaves: leaves,
	}
}
