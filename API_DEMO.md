# Digi-tionary API Demo

This file demonstrates how to interact with the Digi-tionary API programmatically.

## Setup

```bash
# Start the server
python main.py
```

The API will be available at `http://localhost:8000`

## API Examples

### 1. Add a Word

```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "addWord",
    "term": "Blockchain",
    "content": "A distributed ledger technology that uses cryptographic hashing to create an immutable record of transactions.",
    "commitMsg": "Initial definition"
  }'
```

**Response:**
```json
{
  "success": true,
  "wordId": 1,
  "message": "Word created successfully"
}
```

### 2. Update a Word

```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updateWord",
    "wordId": 1,
    "content": "A distributed ledger technology that uses cryptographic hashing to create an immutable record of transactions. Pioneered by Bitcoin.",
    "commitMsg": "Added historical context"
  }'
```

**Response:**
```json
{
  "success": true,
  "wordId": 1,
  "message": "Word updated successfully"
}
```

### 3. Create a Dictionary

```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createDictionary",
    "title": "Crypto Glossary",
    "wordIds": [1, 2, 3, 4, 5]
  }'
```

**Response:**
```json
{
  "success": true,
  "dictionaryId": 1,
  "message": "Dictionary published successfully"
}
```

### 4. Get All Words

```bash
curl -X GET "http://localhost:8000/api/chain/words"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "term": "Blockchain",
      "owner": "0x1234567890123456789012345678901234567890",
      "history": [
        {
          "content": "A distributed ledger...",
          "commitMsg": "Initial definition",
          "timestamp": 1674500000,
          "author": "0x1234567890123456789012345678901234567890"
        },
        {
          "content": "A distributed ledger... Pioneered by Bitcoin.",
          "commitMsg": "Added historical context",
          "timestamp": 1674500100,
          "author": "0x1234567890123456789012345678901234567890"
        }
      ],
      "active": true
    }
  ]
}
```

### 5. Get All Dictionaries

```bash
curl -X GET "http://localhost:8000/api/chain/library"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Crypto Glossary",
      "author": "0x1234567890123456789012345678901234567890",
      "wordIds": [1, 2, 3, 4, 5],
      "timestamp": 1674500200
    }
  ]
}
```

## Python Example

```python
import requests
import json

BASE_URL = "http://localhost:8000"
USER_ADDRESS = "0x1234567890123456789012345678901234567890"

# Add a word
def add_word(term, content, commit_msg):
    payload = {
        "action": "addWord",
        "term": term,
        "content": content,
        "commitMsg": commit_msg
    }
    response = requests.post(
        f"{BASE_URL}/api/chain/transaction?address={USER_ADDRESS}",
        json=payload
    )
    return response.json()

# Get all words
def get_words():
    response = requests.get(f"{BASE_URL}/api/chain/words")
    return response.json()

# Example usage
result = add_word(
    term="Ethereum",
    content="A blockchain platform that enables smart contracts.",
    commit_msg="Added Ethereum definition"
)
print(result)

words = get_words()
print(f"Total words: {len(words['data'])}")
```

## Error Handling

### Invalid Address
```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=invalid" \
  -H "Content-Type: application/json" \
  -d '{"action": "addWord", "term": "Test", "content": "Test", "commitMsg": "Test"}'
```

**Response:**
```json
{
  "detail": "Invalid address"
}
```

### Missing Content
```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890" \
  -H "Content-Type: application/json" \
  -d '{"action": "addWord", "term": "Test", "content": "", "commitMsg": "Test"}'
```

**Response:**
```json
{
  "detail": "Term and content are required"
}
```

### Word Not Found
```bash
curl -X POST "http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890" \
  -H "Content-Type: application/json" \
  -d '{"action": "updateWord", "wordId": 999, "content": "New content", "commitMsg": "Update"}'
```

**Response:**
```json
{
  "detail": "Word does not exist"
}
```

## Testing with Postman

1. Open Postman
2. Create a new request
3. Set method to `POST`
4. Enter URL: `http://localhost:8000/api/chain/transaction?address=0x1234567890123456789012345678901234567890`
5. Go to Headers tab, add: `Content-Type: application/json`
6. Go to Body tab, select Raw JSON and paste payload
7. Click Send

## Health Check

```bash
curl -X GET "http://localhost:8000/api/health"
```

**Response:**
```json
{
  "status": "ok"
}
```
