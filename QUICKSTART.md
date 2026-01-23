# Digi-tionary - Quick Start Guide

**A decentralized, collaborative dictionary platform with blockchain-backed version control.**

## What is Digi-tionary?

Digi-tionary is a Web3 application that enables users to:
- 📝 **Create & publish words** to an immutable, decentralized ledger
- 🔄 **Maintain version history** with Git-like commit messages for every edit
- 📚 **Curate dictionaries** by collecting words into themed collections
- 🔐 **Sign in with Ethereum** using MetaMask wallet for Web3 authentication

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                    Sign in with Ethereum                    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   Backend API (FastAPI)                      │
│          /api/auth/siwe  /api/chain/transaction              │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│            Custom Python EVM (StateManager)                  │
│    Words • Dictionaries • Version History • Accounts         │
└──────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MetaMask browser extension
- Git

### Backend Setup

```bash
# Navigate to project root
cd Digi-tionary

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (port 8000)
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (port 5173, proxies to localhost:8000)
npm run dev
```

Open your browser to `http://localhost:5173`

## How to Use

### 1. **Connect Your Wallet**
- Click "Sign in with Ethereum"
- MetaMask will prompt you to sign a message (SIWE)
- You're authenticated without sending transactions!

### 2. **Create a Word**
- Go to "Create & Manage Words"
- Enter a term (e.g., "Blockchain")
- Write the definition
- Add a commit message (like Git: "Added blockchain definition")
- Click "Mint Word"
- Word appears on the blockchain immediately

### 3. **Update a Word**
- In your repository on the right, click a word
- Edit the definition
- Add a new commit message
- Click "Commit Changes"
- Version is appended to history

### 4. **Create a Dictionary**
- Go to "The Library"
- Click "Publish Dictionary"
- Enter a title (e.g., "Crypto Glossary")
- All published words are included
- Dictionary is immutable on-chain

### 5. **View History**
- Click any word in your repository
- View version history on the left sidebar
- Each version shows: author, timestamp, commit message

## Core Features

### ✅ Version Control
- Every word edit creates a new version
- Full history maintained on-chain
- Git-like commit messages
- Track author and timestamp of each change

### ✅ Decentralized Authentication
- SIWE (Sign-In with Ethereum) protocol
- No passwords, no email
- Users authenticate with their wallet
- Verified cryptographically

### ✅ Immutable Publishing
- Once published, dictionaries cannot be edited
- All data persists on the EVM state manager
- Word versions form an immutable chain

### ✅ Community-Driven
- Anyone can create words
- Multiple users can collaborate
- Public dictionaries for everyone to discover

## Project Files Structure

```
Digi-tionary/
├── frontend/                # React app
│   ├── src/
│   │   ├── App.jsx         # Auth & routing
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePage.jsx
│   │   │   └── Library.jsx
│   │   └── main.jsx
│   └── package.json
│
├── api/
│   └── main.py             # FastAPI server
│
├── evm/                    # Custom EVM Implementation
│   ├── core/
│   │   └── state.py        # StateManager (blockchain state)
│   ├── execution/
│   │   └── evm.py          # EVM logic
│   └── constants/
│       └── opcodes.py
│
├── contracts/
│   └── Digitionary.sol     # Smart contract spec
│
├── tests/
│   ├── test_evm.py
│   ├── test_stack.py
│   ├── test_memory.py
│   └── test_storage.py
│
├── main.py                 # Entry point
├── requirements.txt        # Python dependencies
└── README.md
```

## Testing

### Run Python Tests
```bash
# From root directory
pytest tests/
```

### Test Transaction Flow
1. Connect wallet
2. Create a word → Check API response
3. Update word → Verify version count increases
4. Create dictionary → Verify all words included
5. View library → Confirm data persisted

## API Endpoints

### Authentication
- `POST /api/auth/siwe` - Sign in with Ethereum
- `POST /api/auth/logout` - Logout

### Blockchain
- `POST /api/chain/transaction` - Execute transaction (addWord, updateWord, createDictionary)
- `GET /api/chain/words` - Fetch all words
- `GET /api/chain/library` - Fetch all dictionaries

### Health
- `GET /api/health` - Server health check

## Sample Transaction Payloads

### Add Word
```json
{
  "action": "addWord",
  "term": "Blockchain",
  "content": "A distributed ledger technology using cryptographic hashing...",
  "commitMsg": "Initial definition"
}
```

### Update Word
```json
{
  "action": "updateWord",
  "wordId": 1,
  "content": "A distributed ledger technology...",
  "commitMsg": "Added examples"
}
```

### Create Dictionary
```json
{
  "action": "createDictionary",
  "title": "Crypto Glossary",
  "wordIds": [1, 2, 3]
}
```

## Technology Stack

- **Frontend**: React 18, React Router, Tailwind CSS, ethers.js, SIWE
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Blockchain**: Custom Python EVM (simulating Ethereum)
- **Smart Contracts**: Solidity (reference)
- **Authentication**: SIWE (Sign-In with Ethereum)

## Future Enhancements

- 🚀 Deploy to real blockchain (Ethereum, Polygon, Arbitrum)
- 💬 Add community voting on word definitions
- 🏆 Reputation system for word contributors
- 🔍 Full-text search across all words
- 📊 Analytics dashboard for dictionary stats
- 🌍 Multi-language support

## Troubleshooting

### "MetaMask not found"
- Install MetaMask extension: https://metamask.io

### API Connection Errors
- Ensure backend is running: `python main.py`
- Check CORS settings in `/api/main.py`
- Verify frontend proxy to `localhost:8000`

### Transaction Fails
- Check browser console for error details
- Verify address format (must start with `0x`)
- Ensure content is not empty

## Team & Attribution

Built for a hackathon with ❤️

---

**Questions?** Check the code, it's well-commented!
