from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from siwe import SiweMessage
from eth_account.messages import encode_defunct
from web3 import Web3
import secrets
import time
from typing import List, Optional

# Import blockchain client for real blockchain interaction
from api.blockchain_client import blockchain_client

# Import fallback in-memory EVM for when blockchain is not available
from evm.execution.evm import EVM

app = FastAPI()

# Initialize fallback EVM
fallback_evm = EVM()

# Check if blockchain is available
USE_REAL_BLOCKCHAIN = blockchain_client.is_connected()
print(f"🔗 Blockchain connection: {'Connected to Hardhat' if USE_REAL_BLOCKCHAIN else 'Using fallback EVM'}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}

class SIWEAuth(BaseModel):
    message: str
    signature: str

class Transaction(BaseModel):
    action: str
    term: Optional[str] = None
    content: Optional[str] = None
    commitMsg: Optional[str] = None
    wordId: Optional[int] = None
    title: Optional[str] = None
    wordIds: Optional[List[int]] = None

class StakeRequest(BaseModel):
    amount: float  # ETH amount

@app.post("/api/auth/siwe")
async def siwe_auth(auth: SIWEAuth):
    try:
        siwe_message = SiweMessage.from_message(message=auth.message)
        
        w3 = Web3()
        message_hash = encode_defunct(text=auth.message)
        recovered_address = w3.eth.account.recover_message(
            message_hash, 
            signature=auth.signature
        )
        
        if recovered_address.lower() != siwe_message.address.lower():
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        session_id = secrets.token_urlsafe(32)
        sessions[session_id] = {
            "address": siwe_message.address,
            "authenticated": True
        }
        
        return {
            "success": True,
            "session_id": session_id,
            "address": siwe_message.address
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/auth/sso")
async def sso_redirect():
    return {"redirect_url": "https://your-sso-provider.com/auth"}

@app.post("/api/auth/logout")
async def logout():
    return {"success": True}

@app.get("/api/health")
async def health():
    return {"status": "ok", "blockchain": USE_REAL_BLOCKCHAIN}

# --- Blockchain Endpoints ---

@app.get("/api/chain/status")
async def blockchain_status():
    """Get blockchain connection status and stats."""
    if USE_REAL_BLOCKCHAIN:
        stats = blockchain_client.get_stats()
        return {
            "connected": stats.get("connected", False),
            "blockchain_type": "hardhat",
            "stats": stats
        }
    else:
        stats = fallback_evm.get_blockchain_stats()
        return {
            "connected": True,
            "blockchain_type": "fallback_evm",
            "stats": stats
        }

@app.post("/api/chain/stake")
async def stake_eth(request: StakeRequest):
    """Stake ETH for Proof of Stake participation."""
    if not USE_REAL_BLOCKCHAIN:
        raise HTTPException(status_code=503, detail="Staking requires real blockchain")
    
    result = blockchain_client.stake(request.amount)
    if not result["success"]:
        raise HTTPException(status_code=400, detail="Staking failed")
    return result

@app.get("/api/chain/stake/{address}")
async def get_stake(address: str):
    """Get user's current stake."""
    if USE_REAL_BLOCKCHAIN:
        stake = blockchain_client.get_user_stake(address)
        return {"address": address, "stake_eth": stake}
    return {"address": address, "stake_eth": 0}

@app.post("/api/chain/transaction")
async def submit_transaction(tx: Transaction, address: str):
    """Submit a transaction to the blockchain."""
    if USE_REAL_BLOCKCHAIN:
        return await _execute_blockchain_tx(tx, address)
    else:
        result = fallback_evm.execute_transaction(address, tx.model_dump())
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result

@app.post("/api/chain/publish")
async def publish_to_blockchain(tx: Transaction, address: str):
    """Explicitly publish a transaction to the blockchain with validation."""
    if not address:
        raise HTTPException(status_code=401, detail="Wallet address required")
    
    if USE_REAL_BLOCKCHAIN:
        result = await _execute_blockchain_tx(tx, address)
        return {
            **result,
            "blockchain_confirmed": True,
            "blockchain_type": "hardhat",
            "published_by": address,
            "timestamp": int(time.time())
        }
    else:
        result = fallback_evm.execute_transaction(address, tx.model_dump())
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))
        return {
            **result,
            "blockchain_confirmed": True,
            "blockchain_type": "fallback_evm",
            "published_by": address,
            "timestamp": int(time.time())
        }

async def _execute_blockchain_tx(tx: Transaction, address: str):
    """Execute a transaction on the real blockchain."""
    action = tx.action
    
    if action == "addWord":
        if not tx.term or not tx.content:
            raise HTTPException(status_code=400, detail="Missing term or content")
        result = blockchain_client.add_word(tx.term, tx.content, tx.commitMsg or "")
        if result.get("success"):
            return {
                "success": True,
                "wordId": result["word_id"],
                "tx_hash": result["tx_hash"],
                "block_number": result["block_number"]
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to add word")
    
    elif action == "updateWord":
        if tx.wordId is None or not tx.content:
            raise HTTPException(status_code=400, detail="Missing wordId or content")
        result = blockchain_client.update_word(tx.wordId, tx.content, tx.commitMsg or "")
        if result.get("success"):
            return {
                "success": True,
                "wordId": result["word_id"],
                "tx_hash": result["tx_hash"],
                "block_number": result["block_number"]
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update word")
    
    elif action == "createDictionary":
        if not tx.title or not tx.wordIds:
            raise HTTPException(status_code=400, detail="Missing title or wordIds")
        result = blockchain_client.create_dictionary(tx.title, tx.wordIds)
        if result.get("success"):
            return {
                "success": True,
                "dictionaryId": result["dictionary_id"],
                "tx_hash": result["tx_hash"],
                "block_number": result["block_number"]
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create dictionary")
    
    else:
        raise HTTPException(status_code=400, detail="Unknown action")

@app.get("/api/chain/words")
async def get_words():
    """Get all words from the blockchain."""
    if USE_REAL_BLOCKCHAIN:
        return blockchain_client.get_all_words()
    return fallback_evm.get_state().get_all_words()

@app.get("/api/chain/library")
async def get_library():
    """Get all dictionaries from the blockchain."""
    if USE_REAL_BLOCKCHAIN:
        return blockchain_client.get_all_dictionaries()
    return fallback_evm.get_state().get_all_dictionaries()

@app.get("/api/chain/word/{word_id}")
async def get_word(word_id: int):
    """Get a specific word by ID."""
    if USE_REAL_BLOCKCHAIN:
        word = blockchain_client.get_word(word_id)
        if "error" in word:
            raise HTTPException(status_code=404, detail="Word not found")
        return word
    raise HTTPException(status_code=404, detail="Word not found")
