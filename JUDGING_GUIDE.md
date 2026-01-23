# Digi-tionary - Hackathon Submission Guide

Thank you for evaluating **Digi-tionary**! This guide will help you understand and test the project quickly.

## Quick Start (5 minutes)

### Step 1: Install & Run

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
bash start.sh
```

This will:
1. Create a Python virtual environment
2. Install all dependencies
3. Start the backend server (port 8000)
4. Start the frontend dev server (port 5173)

### Step 2: Open in Browser

Navigate to: **http://localhost:5173**

### Step 3: Test the App

1. **Sign In**: Click "Sign in with Ethereum"
   - MetaMask will prompt you to sign a message
   - No gas fees, no transactions!

2. **Create a Word** (in "Create & Manage Words"):
   - Term: "Blockchain"
   - Definition: "A distributed ledger using cryptographic hashing..."
   - Commit Message: "Initial definition"
   - Click "Mint Word"

3. **Update the Word**:
   - Click the word in your repository (right sidebar)
   - Edit the definition
   - Add commit message: "Added blockchain history"
   - Click "Commit Changes"
   - ✅ Version history is tracked!

4. **Create a Dictionary** (in "The Library"):
   - Click "Publish Dictionary"
   - Enter title: "Crypto Glossary"
   - ✅ Dictionary published with all words!

5. **View Results**:
   - Check "The Library" to see your published dictionary
   - View word version history in the editor

---

## Key Features to Highlight

### 🔐 Web3 Authentication
- Uses **SIWE (Sign-In with Ethereum)**
- Secure wallet-based authentication
- No passwords, no email
- Try with different MetaMask accounts to see separate repositories

### 📝 Decentralized Content
- All words stored in custom Python EVM
- Version control with Git-like commits
- Track author and timestamp of each change
- Immutable once published in dictionary

### ⛓️ Blockchain Simulation
- Custom Python EVM mimics Ethereum behavior
- StateManager maintains word and dictionary state
- Transaction execution with validation
- Full history preservation

### 🎨 Modern UI/UX
- React with Tailwind CSS
- Responsive design (desktop/tablet/mobile)
- Real-time feedback with loading states
- Smooth navigation between pages

---

## Architecture Overview

```
┌─────────────────┐
│   MetaMask      │
│   (wallet)      │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│   React Frontend        │
│   (Sign in, Create,     │
│    Update, Browse)      │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│   FastAPI Backend       │
│   (SIWE auth, routes    │
│    to EVM)              │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│   Python EVM            │
│   (StateManager,        │
│    Words, Dictionaries) │
└─────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router, Tailwind CSS, ethers.js |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Blockchain** | Custom Python EVM (StateManager) |
| **Auth** | SIWE (Sign-In with Ethereum) |
| **Smart Contracts** | Solidity (reference implementation) |

---

## Project Structure

```
Digi-tionary/
├── frontend/                    # React app
│   └── src/pages/
│       ├── Dashboard.jsx        # Home page
│       ├── CreatePage.jsx       # Word editor with version control
│       └── Library.jsx          # Browse & create dictionaries
├── api/main.py                  # FastAPI server
├── evm/
│   ├── core/state.py           # StateManager (blockchain state)
│   ├── execution/evm.py        # EVM transaction executor
│   └── contracts/Digitionary.sol # Smart contract spec
├── tests/                       # Test files
├── QUICKSTART.md               # Detailed setup guide
├── API_DEMO.md                 # API usage examples
└── main.py                      # Entry point
```

---

## Testing Scenarios

### ✅ Test 1: Basic Word Creation
1. Sign in
2. Create word "Decentralization"
3. Verify word appears in "Your Repository"
4. Check version count = 1

**Expected**: Word visible immediately, no errors

### ✅ Test 2: Version Control
1. Create word "DeFi"
2. Click word to edit
3. Update content, add commit message
4. Create another version
5. Check word shows "v2" in repository

**Expected**: Version history tracked, each version has timestamp and author

### ✅ Test 3: Dictionary Creation
1. Create 2-3 words (any terms)
2. Go to Library
3. Click "Publish Dictionary"
4. Enter title "Test Dictionary"
5. Verify it appears in the library

**Expected**: Dictionary shows all words, creator address, and timestamp

### ✅ Test 4: Multiple Users
1. Create word with Account A
2. Switch MetaMask account to Account B
3. Create different word
4. Both words visible in library (create dictionary to confirm)

**Expected**: Each user has separate repository, but can see all community words

### ✅ Test 5: Error Handling
1. Try to create word with empty content
2. Try to create dictionary with no words
3. Try to update non-existent word ID

**Expected**: Appropriate error messages, clean recovery

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/siwe` | Sign in with Ethereum |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/chain/transaction?address=0x...` | Execute transaction (addWord, updateWord, createDictionary) |
| GET | `/api/chain/words` | Fetch all words |
| GET | `/api/chain/library` | Fetch all dictionaries |
| GET | `/api/health` | Server health check |

See `API_DEMO.md` for curl examples.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MetaMask not found" | Install MetaMask: https://metamask.io |
| "Cannot connect to backend" | Ensure `python main.py` is running on port 8000 |
| "Transaction failed" | Check browser console, verify address format (0x...) |
| "Words not loading" | Clear browser cache, refresh page |
| "Frontend won't start" | Ensure Node.js 18+ installed, run `npm install` in frontend/ |

---

## Judging Checklist

- [ ] Frontend loads and displays login page
- [ ] Can sign in with MetaMask (no gas fees!)
- [ ] Can create a word successfully
- [ ] Word appears in "Your Repository" with version counter
- [ ] Can update a word (version increments)
- [ ] Version history shows commits and timestamps
- [ ] Can create a dictionary from words
- [ ] Dictionary appears in "The Library"
- [ ] Can switch MetaMask accounts and see different repositories
- [ ] All words visible across accounts (for dictionary creation)
- [ ] API returns properly formatted JSON responses
- [ ] Error handling works (invalid input, etc.)
- [ ] UI is responsive and polished
- [ ] Code is clean and well-commented

---

## What Makes This Project Special

✨ **Innovative**: Combines Git-like version control with blockchain  
🔒 **Secure**: Web3 authentication without passwords  
⚡ **Fast**: No gas fees, instant transactions  
🎨 **Beautiful**: Modern, responsive UI  
📚 **Extensible**: Can deploy to real blockchain (Ethereum, Polygon, etc.)

---

## Contact & Questions

For any issues or questions, check:
1. `QUICKSTART.md` - Detailed setup instructions
2. `API_DEMO.md` - API usage examples
3. Code comments - Well-documented throughout

---

## Future Roadmap

- Deploy to Ethereum/Polygon testnet
- IPFS integration for content storage
- Community voting on definitions
- Reputation system for contributors
- Full-text search across dictionaries
- Multi-language support

---

**Thank you for reviewing Digi-tionary! 🚀**

We're excited to see what you think!
