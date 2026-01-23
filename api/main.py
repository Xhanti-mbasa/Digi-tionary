from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from siwe import SiweMessage
from eth_account.messages import encode_defunct
from web3 import Web3
import secrets
from typing import List, Optional

# Import our custom EVM
from evm.execution.evm import EVM

app = FastAPI()
# Initialize the Blockchain (EVM)
evm = EVM()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    return {"status": "ok"}

# --- Blockchain Endpoints ---

@app.post("/api/chain/transaction")
async def submit_transaction(tx: Transaction, address: str): # In real app, verify session
    # We pass the address as the 'sender' to the EVM
    result = evm.execute_transaction(address, tx.model_dump())
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@app.get("/api/chain/words")
async def get_words():
    return evm.get_state().get_all_words()

@app.get("/api/chain/library")
async def get_library():
    return evm.get_state().get_all_dictionaries()
