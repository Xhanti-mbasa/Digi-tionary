# Digi-tionary 📖⛓️

A decentralized dictionary platform powered by a local blockchain. Create, publish, and manage dictionary entries using blockchain technology for immutable, verifiable content.

## Features

- **Blockchain-Published Words**: Publish dictionary entries directly to a local Ethereum blockchain
- **Proof of Stake (PoS)**: Stake-based validation for content publishing
- **MetaMask Integration**: Connect your wallet to sign and verify your identity
- **Version History**: All word edits are tracked on-chain with full history
- **Dictionary Creation**: Bundle words into published dictionaries

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **Blockchain**: Hardhat (Scaffold-ETH-2) running locally
- **Smart Contract**: `Digitionary.sol` for word/dictionary management
- **Authentication**: Sign-In with Ethereum (SIWE)

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18.17+
- Yarn (for blockchain)
- MetaMask browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/Digi-tionary.git
cd Digi-tionary

# Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install blockchain dependencies
cd blockchain
yarn install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Running the Application

**Terminal 1 - Start Local Blockchain:**
```bash
cd blockchain
yarn chain
```

**Terminal 2 - Deploy Contract:**
```bash
cd blockchain
yarn deploy
```

**Terminal 3 - Start Backend:**
```bash
source venv/bin/activate
python main.py
```

**Terminal 4 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Access the app at `http://localhost:3000`

## Connecting MetaMask to Local Blockchain

1. Open MetaMask
2. Add Network → Add network manually:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chain/status` | GET | Blockchain connection status |
| `/api/chain/words` | GET | Get all published words |
| `/api/chain/publish` | POST | Publish word to blockchain |
| `/api/chain/stake` | POST | Stake ETH for publishing |
| `/api/chain/library` | GET | Get all dictionaries |

## Smart Contract

The `Digitionary.sol` contract is deployed to the local Hardhat chain at:
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Key Functions:
- `stake()` - Stake ETH to become a publisher
- `addWord(term, content, commitMsg)` - Add a new word
- `updateWord(wordId, content, commitMsg)` - Update existing word
- `createDictionary(title, wordIds)` - Create a dictionary

## Development

```bash
# Run backend with hot reload
python main.py

# Run frontend with hot reload
cd frontend && npm run dev

# Deploy contract changes
cd blockchain && yarn deploy
```

## ⚠️ Important Notes

- **Local Development Only**: The Hardhat node and test accounts are for development. Never use them on mainnet.
- **Data Persistence**: Blockchain state resets when Hardhat restarts. The fallback EVM persists to `.digitionary_blockchain.json`.

## License

MIT
