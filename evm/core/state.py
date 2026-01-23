from typing import Dict, List, Any
import time

class Account:
    def __init__(self, address: str, balance: int = 0):
        self.address = address
        self.balance = balance
        self.nonce = 0
        self.storage: Dict[str, Any] = {} # Contract storage

class StateManager:
    def __init__(self):
        self.accounts: Dict[str, Account] = {}
        # Specialized storage for our Digitionary contract
        self.words: Dict[int, Dict] = {}
        self.dictionaries: Dict[int, Dict] = {}
        self.word_count = 0
        self.dictionary_count = 0

    def get_account(self, address: str) -> Account:
        if address not in self.accounts:
            self.accounts[address] = Account(address)
        return self.accounts[address]

    def add_word(self, term: str, content: str, commit_msg: str, author: str) -> int:
        self.word_count += 1
        word_id = self.word_count
        
        timestamp = int(time.time())
        version = {
            "content": content,
            "commitMsg": commit_msg,
            "timestamp": timestamp,
            "author": author
        }
        
        self.words[word_id] = {
            "id": word_id,
            "term": term,
            "owner": author,
            "history": [version],
            "active": True
        }
        return word_id

    def update_word(self, word_id: int, content: str, commit_msg: str, author: str):
        if word_id not in self.words:
            raise Exception("Word does not exist")
        
        timestamp = int(time.time())
        version = {
            "content": content,
            "commitMsg": commit_msg,
            "timestamp": timestamp,
            "author": author
        }
        
        self.words[word_id]["history"].append(version)

    def create_dictionary(self, title: str, word_ids: List[int], author: str) -> int:
        # Business logic validation could happen here or in EVM execution
        self.dictionary_count += 1
        dict_id = self.dictionary_count
        
        self.dictionaries[dict_id] = {
            "id": dict_id,
            "title": title,
            "author": author,
            "wordIds": word_ids,
            "timestamp": int(time.time())
        }
        return dict_id
    
    def get_all_words(self) -> List[Dict]:
        return list(self.words.values())

    def get_all_dictionaries(self) -> List[Dict]:
        return list(self.dictionaries.values())
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize state to dictionary for persistence."""
        return {
            "words": self.words,
            "dictionaries": self.dictionaries,
            "word_count": self.word_count,
            "dictionary_count": self.dictionary_count,
            "accounts": {addr: {
                "address": acc.address,
                "balance": acc.balance,
                "nonce": acc.nonce,
                "storage": acc.storage
            } for addr, acc in self.accounts.items()}
        }
    
    def from_dict(self, data: Dict[str, Any]):
        """Load state from dictionary."""
        self.words = data.get("words", {})
        # Convert string keys back to int for words
        self.words = {int(k): v for k, v in self.words.items()}
        
        self.dictionaries = data.get("dictionaries", {})
        # Convert string keys back to int for dictionaries
        self.dictionaries = {int(k): v for k, v in self.dictionaries.items()}
        
        self.word_count = data.get("word_count", 0)
        self.dictionary_count = data.get("dictionary_count", 0)
        
        # Restore accounts
        accounts_data = data.get("accounts", {})
        for addr, acc_data in accounts_data.items():
            acc = Account(addr, acc_data.get("balance", 0))
            acc.nonce = acc_data.get("nonce", 0)
            acc.storage = acc_data.get("storage", {})
            self.accounts[addr] = acc
