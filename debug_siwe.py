import requests
from eth_account import Account
from eth_account.messages import encode_defunct
import datetime

def create_siwe_message(address, statement, chain_id, nonce):
    domain = "localhost:3000"
    origin = "http://localhost:3000"
    version = "1"
    # Use exact same format as frontend
    issued_at = datetime.datetime.utcnow().isoformat() + "Z"
    
    return f"""{domain} wants you to sign in with your Ethereum account:
{address}

{statement}

URI: {origin}
Version: {version}
Chain ID: {chain_id}
Nonce: {nonce}
Issued At: {issued_at}"""

# Setup
acct = Account.create()
address = acct.address
nonce = "1234567812345678"
chain_id = 1
statement = "Sign in to Digi-tionary"

# Generate Message
message = create_siwe_message(address, statement, chain_id, nonce)
print(f"DEBUG: Generated Message:\n---\n{message}\n---")

# Sign
msg_hash = encode_defunct(text=message)
signature = acct.sign_message(msg_hash).signature.hex()

# Send
url = "http://localhost:8000/api/auth/siwe"
payload = {
    "message": message,
    "signature": signature
}

print("Sending request...")
try:
    res = requests.post(url, json=payload)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Failed: {e}")
