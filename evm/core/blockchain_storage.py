import json
import os
from typing import Dict, Any

class BlockchainStorage:
    """Handles persistence of blockchain state to local JSON file."""
    
    def __init__(self, filepath: str = ".digitionary_blockchain.json"):
        self.filepath = filepath
    
    def save_state(self, state_data: Dict[str, Any]) -> bool:
        """
        Save blockchain state to JSON file.
        
        Args:
            state_data: Dictionary containing blockchain state
            
        Returns:
            True if save successful, False otherwise
        """
        try:
            with open(self.filepath, 'w') as f:
                json.dump(state_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving blockchain state: {e}")
            return False
    
    def load_state(self) -> Dict[str, Any]:
        """
        Load blockchain state from JSON file.
        
        Returns:
            Dictionary containing blockchain state, or empty dict if file doesn't exist
        """
        if not os.path.exists(self.filepath):
            return {}
        
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading blockchain state: {e}")
            return {}
    
    def export_state(self) -> str:
        """
        Export current blockchain state as JSON string.
        
        Returns:
            JSON string of blockchain state
        """
        state = self.load_state()
        return json.dumps(state, indent=2)
    
    def clear_state(self) -> bool:
        """
        Clear blockchain state (delete the file).
        
        Returns:
            True if cleared successfully
        """
        try:
            if os.path.exists(self.filepath):
                os.remove(self.filepath)
            return True
        except Exception as e:
            print(f"Error clearing blockchain state: {e}")
            return False
