from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from siwe import SiweMessage
from eth_account.messages import encode_defunct
from web3 import Web3
import secrets
from typing import List, Optional
from api.merkle_bridge import MerkleTree

# Import our custom EVM
from evm.execution.evm import EVM

app = FastAPI()
# Initialize the Blockchain (EVM)
evm = EVM()

from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"DEBUG: Validation Error: {exc.errors()}")
    body = await request.body()
    print(f"DEBUG: Invalid Body: {body.decode()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode()},
    )

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
    username: Optional[str] = None

@app.post("/api/auth/siwe")
async def siwe_auth(auth: SIWEAuth):
    try:
        print(f"DEBUG: SIWE Message received: {auth.message}")
        print(f"DEBUG: SIWE Signature: {auth.signature}")
        
        siwe_message = SiweMessage.from_message(message=auth.message)
        
        w3 = Web3()
        message_hash = encode_defunct(text=auth.message)
        recovered_address = w3.eth.account.recover_message(
            message_hash, 
            signature=auth.signature
        )
        
        print(f"DEBUG: Recovered: {recovered_address}, Expected: {siwe_message.address}")

        if recovered_address.lower() != siwe_message.address.lower():
            print("DEBUG: Signature Mismatch!")
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
@app.get("/api/chain/account/{address}")
async def get_account(address: str):
    account = evm.get_state().get_account(address)
    return {
        "address": account.address,
        "username": account.username,
        "balance": account.balance
    }

@app.get("/api/chain/graph")
async def get_graph():
    state = evm.get_state()
    words = state.get_all_words()
    dictionaries = state.get_all_dictionaries()
    
    # 1. Rebuild Merkle Tree from current words
    terms = [w['term'] for w in words]
    if terms:
        MerkleTree.add_words(terms)
        merkle_data = MerkleTree.get_graph() # Returns {nodes: [], links: []}
        
    else:
        merkle_data = {"nodes": [], "links": []}

    nodes = merkle_data.get("nodes", [])
    links = merkle_data.get("links", [])
    
    # helper to find leaf node ID by label (term)
    # Merkle Leaves have label == term
    def find_leaf_id(term):
        for n in nodes:
            if n.get("type") == "leaf" and n.get("label") == term:
                return n["id"]
        return None

    # 2. Add Accounts (Authors) and Link to Leaves
    authors = set()
    for w in words:
        authors.add(w['owner'])
    for d in dictionaries:
        authors.add(d['author'])
        
    for author in authors:
        acc = state.get_account(author)
        label = acc.username if acc.username else f"{author[:6]}...{author[-4:]}"
        user_node_id = f"user_{author}"
        
        nodes.append({
            "id": user_node_id,
            "label": label,
            "type": "user",
            "val": 20
        })
        
        # Link User -> Word (Leaf)
        # Find all words owned by this user
        user_words = [w for w in words if w['owner'] == author]
        for w in user_words:
            leaf_id = find_leaf_id(w['term'])
            if leaf_id:
                links.append({"source": user_node_id, "target": leaf_id})

    # 3. Add Dictionaries
    for d in dictionaries:
        dict_node_id = f"dict_{d['id']}"
        nodes.append({
            "id": dict_node_id,
            "label": d['title'],
            "type": "dictionary",
            "val": 15
        })
        
        # Link Author -> Dictionary
        links.append({
            "source": f"user_{d['author']}",
            "target": dict_node_id
        })
        
        # Link Dictionary -> Words (Leaves)
        for wid in d['wordIds']:
            # Find term for this word ID
            word_obj = next((w for w in words if w['id'] == wid), None)
            if word_obj:
                leaf_id = find_leaf_id(word_obj['term'])
                if leaf_id:
                    links.append({"source": dict_node_id, "target": leaf_id})

    return {"nodes": nodes, "links": links}
