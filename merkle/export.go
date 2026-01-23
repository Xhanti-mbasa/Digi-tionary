package main

/*
#include <stdlib.h>

// Define a C-compatible struct for node data if needed
// For now, we return JSON string or simple types
*/
import "C"

import (
	"encoding/json"
	"strings"
	"unsafe"
)

// Global map to store trees (mocking persistence for session-based trees)
// In a real app, this might be a database or keyed by session ID
var currentTree *MerkleTree

// export AddWords
//export AddWords
func AddWords(wordsStr *C.char) *C.char {
	input := C.GoString(wordsStr)
	words := strings.Split(input, ",")

	// Clean whitespace
	var cleanWords []string
	for _, w := range words {
		if trimmed := strings.TrimSpace(w); trimmed != "" {
			cleanWords = append(cleanWords, trimmed)
		}
	}

	// Build new tree (simple implementation: rebuilds tree every time)
	// In production, we might append to existing leaves
	currentTree = NewMerkleTree(cleanWords)

	return C.CString(currentTree.Root.Hash)
}

// export GetRoot
//export GetRoot
func GetRoot() *C.char {
	if currentTree == nil || currentTree.Root == nil {
		return C.CString("")
	}
	return C.CString(currentTree.Root.Hash)
}

// GraphNode represents a node for the frontend graph
type GraphNode struct {
	ID    string `json:"id"`
	Label string `json:"label,omitempty"`
	Level int    `json:"level"`
	Type  string `json:"type"` // "leaf" or "internal"
}

// GraphLink represents a link between nodes
type GraphLink struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

// GraphData holds nodes and links
type GraphData struct {
	Nodes []GraphNode `json:"nodes"`
	Links []GraphLink `json:"links"`
}

// export GetGraphJSON
//export GetGraphJSON
func GetGraphJSON() *C.char {
	if currentTree == nil || currentTree.Root == nil {
		return C.CString(`{"nodes": [], "links": []}`)
	}

	data := GraphData{}
	
	// BFS to traverse and build graph
	queue := []*Node{currentTree.Root}
	visited := make(map[string]bool)

	for len(queue) > 0 {
		n := queue[0]
		queue = queue[1:]

		if n == nil {
			continue
		}

		// Add Node
		if !visited[n.Hash] {
			typ := "internal"
			if n.Left == nil && n.Right == nil {
				typ = "leaf"
			}
			label := n.Data
			if typ == "internal" {
				label = n.Hash[:8] + "..." // Short hash for internal nodes
			}

			// Calculate level roughly (or we can store it in Node struct if needed)
			// For visualization, force-graph handles positioning, level is metadata
			data.Nodes = append(data.Nodes, GraphNode{
				ID:    n.Hash,
				Label: label,
				Level: 0, // Placeholder
				Type:  typ,
			})
			visited[n.Hash] = true
		}

		// Add Links and enqueue children
		if n.Left != nil {
			data.Links = append(data.Links, GraphLink{Source: n.Hash, Target: n.Left.Hash})
			queue = append(queue, n.Left)
		}
		if n.Right != nil {
			data.Links = append(data.Links, GraphLink{Source: n.Hash, Target: n.Right.Hash})
			queue = append(queue, n.Right)
		}
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return C.CString("{}")
	}

	return C.CString(string(jsonData))
}

// export FreeString
//export FreeString
func FreeString(str *C.char) {
	C.free(unsafe.Pointer(str))
}

func main() {}
