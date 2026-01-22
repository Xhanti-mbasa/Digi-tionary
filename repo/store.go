package repo

import (
	"crypto/sha256"
	"encoding/hex"
	"sync"
)

type ObjectType uint8

const (
	Blob ObjectType = iota
	Tree
)

type Object struct {
	Type ObjectType
	Data []byte
}

var (
	store = map[string]Object{}
	mu    sync.RWMutex
)

func hashObject(t ObjectType, data []byte) string {
	h := sha256.Sum256(append([]byte{byte(t)}, data...))
	return hex.EncodeToString(h[:])
}

func PutObject(t ObjectType, data []byte) string {
	hash := hashObject(t, data)
	mu.Lock()
	store[hash] = Object{Type: t, Data: data}
	mu.Unlock()
	return hash
}

func GetObject(hash string) (Object, bool) {
	mu.RLock()
	obj, ok := store[hash]
	mu.RUnlock()
	return obj, ok
}
