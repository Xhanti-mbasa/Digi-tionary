package repo

import "encoding/json"

type TreeEntry struct {
	Name string
	Mode uint32
	Hash string
}

func PutTree(entries []TreeEntry) string {
	data, _ := json.Marshal(entries)
	return PutObject(Tree, data)
}

func ReadTree(hash string) ([]TreeEntry, bool) {
	obj, ok := GetObject(hash)
	if !ok || obj.Type != Tree {
		return nil, false
	}
	var entries []TreeEntry
	json.Unmarshal(obj.Data, &entries)
	return entries, true
}
