"""
Blockchain client for connecting to local Hardhat node and interacting with Digitionary contract.
"""
from web3 import Web3
from typing import List, Dict, Any, Optional
import json
import os

# Digitionary contract ABI (extracted from deployment)
DIGITIONARY_ABI = [
    # Staking functions
    {"inputs": [], "name": "stake", "outputs": [], "stateMutability": "payable", "type": "function"},
    {"inputs": [{"name": "amount", "type": "uint256"}], "name": "unstake", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "_user", "type": "address"}], "name": "getStake", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    
    # Word functions
    {"inputs": [{"name": "_term", "type": "string"}, {"name": "_content", "type": "string"}, {"name": "_commitMsg", "type": "string"}], "name": "addWord", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "_wordId", "type": "uint256"}, {"name": "_content", "type": "string"}, {"name": "_commitMsg", "type": "string"}], "name": "updateWord", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "_wordId", "type": "uint256"}], "name": "getWord", "outputs": [{"name": "id", "type": "uint256"}, {"name": "term", "type": "string"}, {"name": "owner", "type": "address"}, {"name": "active", "type": "bool"}, {"name": "versionCount", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "_wordId", "type": "uint256"}], "name": "getLatestWordContent", "outputs": [{"name": "term", "type": "string"}, {"name": "content", "type": "string"}, {"name": "commitMsg", "type": "string"}, {"name": "timestamp", "type": "uint256"}, {"name": "author", "type": "address"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "_user", "type": "address"}], "name": "getUserWords", "outputs": [{"name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    
    # Dictionary functions
    {"inputs": [{"name": "_title", "type": "string"}, {"name": "_wordIds", "type": "uint256[]"}], "name": "createDictionary", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"name": "_dictId", "type": "uint256"}], "name": "getDictionary", "outputs": [{"name": "id", "type": "uint256"}, {"name": "title", "type": "string"}, {"name": "author", "type": "address"}, {"name": "wordCount", "type": "uint256"}, {"name": "timestamp", "type": "uint256"}, {"name": "published", "type": "bool"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "_user", "type": "address"}], "name": "getUserDictionaries", "outputs": [{"name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function"},
    
    # Stats
    {"inputs": [], "name": "getStats", "outputs": [{"name": "totalWords", "type": "uint256"}, {"name": "totalDictionaries", "type": "uint256"}, {"name": "totalStakedAmount", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "wordCount", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "dictionaryCount", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalStaked", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
    
    # Events
    {"anonymous": False, "inputs": [{"indexed": True, "name": "wordId", "type": "uint256"}, {"indexed": False, "name": "term", "type": "string"}, {"indexed": True, "name": "author", "type": "address"}], "name": "WordCreated", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "name": "wordId", "type": "uint256"}, {"indexed": False, "name": "commitMsg", "type": "string"}, {"indexed": True, "name": "editor", "type": "address"}], "name": "WordUpdated", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "name": "dictId", "type": "uint256"}, {"indexed": False, "name": "title", "type": "string"}, {"indexed": True, "name": "author", "type": "address"}], "name": "DictionaryCreated", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "name": "user", "type": "address"}, {"indexed": False, "name": "amount", "type": "uint256"}], "name": "Staked", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "name": "user", "type": "address"}, {"indexed": False, "name": "amount", "type": "uint256"}], "name": "Unstaked", "type": "event"},
]

# Default contract address (deployed on local Hardhat)
DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
DEFAULT_RPC_URL = "http://127.0.0.1:8545"

# Hardhat default account for server-side transactions
HARDHAT_ACCOUNT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


class BlockchainClient:
    """Client for interacting with Digitionary smart contract on local blockchain."""
    
    def __init__(
        self, 
        rpc_url: str = DEFAULT_RPC_URL,
        contract_address: str = DEFAULT_CONTRACT_ADDRESS
    ):
        self.rpc_url = rpc_url
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=DIGITIONARY_ABI
        )
        
        # Set up server account for transactions on behalf of users
        self.server_account = self.w3.eth.account.from_key(HARDHAT_ACCOUNT_PRIVATE_KEY)
        
        # Auto-stake the server account if not already staked
        self._ensure_staked()
        
    def is_connected(self) -> bool:
        """Check if connected to blockchain node."""
        try:
            return self.w3.is_connected()
        except Exception:
            return False
    
    def _ensure_staked(self):
        """Ensure the server account has staked ETH for publishing."""
        try:
            if not self.is_connected():
                print("⚠️ Blockchain not connected, skipping auto-stake")
                return
            
            current_stake = self.get_user_stake(self.server_account.address)
            if current_stake < 0.01:
                print("🔒 Server account not staked, staking 1 ETH...")
                result = self.stake(1.0)
                if result.get("success"):
                    print(f"✅ Staked 1 ETH (tx: {result['tx_hash'][:10]}...)")
                else:
                    print("❌ Failed to stake")
            else:
                print(f"✅ Server account already staked: {current_stake} ETH")
        except Exception as e:
            print(f"⚠️ Auto-stake check failed: {e}")
    
    def get_chain_id(self) -> int:
        """Get the chain ID."""
        return self.w3.eth.chain_id
    
    def get_block_number(self) -> int:
        """Get the current block number."""
        return self.w3.eth.block_number
    
    def get_stats(self) -> Dict[str, Any]:
        """Get blockchain and contract statistics."""
        try:
            stats = self.contract.functions.getStats().call()
            return {
                "total_words": stats[0],
                "total_dictionaries": stats[1],
                "total_staked": self.w3.from_wei(stats[2], 'ether'),
                "block_number": self.get_block_number(),
                "chain_id": self.get_chain_id(),
                "connected": self.is_connected(),
                "contract_address": self.contract_address
            }
        except Exception as e:
            return {
                "error": str(e),
                "connected": False
            }
    
    def get_user_stake(self, user_address: str) -> float:
        """Get user's stake amount in ETH."""
        address = Web3.to_checksum_address(user_address)
        stake_wei = self.contract.functions.getStake(address).call()
        return float(self.w3.from_wei(stake_wei, 'ether'))
    
    def stake(self, amount_eth: float) -> Dict[str, Any]:
        """Stake ETH to become a validator."""
        amount_wei = self.w3.to_wei(amount_eth, 'ether')
        
        tx = self.contract.functions.stake().build_transaction({
            'from': self.server_account.address,
            'value': amount_wei,
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.server_account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.server_account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            "success": receipt.status == 1,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber
        }
    
    def add_word(self, term: str, content: str, commit_msg: str, sender: str = None) -> Dict[str, Any]:
        """Add a new word to the blockchain."""
        account = self.server_account
        
        tx = self.contract.functions.addWord(term, content, commit_msg).build_transaction({
            'from': account.address,
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get word ID from event logs
        word_id = None
        for log in receipt.logs:
            try:
                decoded = self.contract.events.WordCreated().process_log(log)
                word_id = decoded.args.wordId
                break
            except:
                pass
        
        return {
            "success": receipt.status == 1,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "word_id": word_id,
            "gas_used": receipt.gasUsed
        }
    
    def update_word(self, word_id: int, content: str, commit_msg: str) -> Dict[str, Any]:
        """Update an existing word."""
        account = self.server_account
        
        tx = self.contract.functions.updateWord(word_id, content, commit_msg).build_transaction({
            'from': account.address,
            'gas': 300000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            "success": receipt.status == 1,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "word_id": word_id
        }
    
    def create_dictionary(self, title: str, word_ids: List[int]) -> Dict[str, Any]:
        """Create a dictionary from word IDs."""
        account = self.server_account
        
        tx = self.contract.functions.createDictionary(title, word_ids).build_transaction({
            'from': account.address,
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(account.address)
        })
        
        signed_tx = self.w3.eth.account.sign_transaction(tx, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get dictionary ID from event logs
        dict_id = None
        for log in receipt.logs:
            try:
                decoded = self.contract.events.DictionaryCreated().process_log(log)
                dict_id = decoded.args.dictId
                break
            except:
                pass
        
        return {
            "success": receipt.status == 1,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "dictionary_id": dict_id
        }
    
    def get_word(self, word_id: int) -> Dict[str, Any]:
        """Get word details."""
        try:
            word = self.contract.functions.getWord(word_id).call()
            latest = self.contract.functions.getLatestWordContent(word_id).call()
            return {
                "id": word[0],
                "term": word[1],
                "owner": word[2],
                "active": word[3],
                "version_count": word[4],
                "content": latest[1],
                "commit_msg": latest[2],
                "timestamp": latest[3],
                "author": latest[4]
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_all_words(self) -> List[Dict[str, Any]]:
        """Get all words from the blockchain."""
        words = []
        word_count = self.contract.functions.wordCount().call()
        
        for i in range(1, word_count + 1):
            word = self.get_word(i)
            if "error" not in word:
                # Format for frontend compatibility
                words.append({
                    "id": word["id"],
                    "term": word["term"],
                    "owner": word["owner"],
                    "active": word["active"],
                    "history": [{
                        "content": word["content"],
                        "commitMsg": word["commit_msg"],
                        "timestamp": word["timestamp"],
                        "author": word["author"]
                    }]
                })
        
        return words
    
    def get_dictionary(self, dict_id: int) -> Dict[str, Any]:
        """Get dictionary details."""
        try:
            d = self.contract.functions.getDictionary(dict_id).call()
            return {
                "id": d[0],
                "title": d[1],
                "author": d[2],
                "word_count": d[3],
                "timestamp": d[4],
                "published": d[5]
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_all_dictionaries(self) -> List[Dict[str, Any]]:
        """Get all dictionaries from the blockchain."""
        dictionaries = []
        dict_count = self.contract.functions.dictionaryCount().call()
        
        for i in range(1, dict_count + 1):
            d = self.get_dictionary(i)
            if "error" not in d:
                dictionaries.append(d)
        
        return dictionaries


# Create global instance
blockchain_client = BlockchainClient()
