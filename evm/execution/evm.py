from evm.core.state import StateManager
import json

class EVM:
    def __init__(self):
        self.state = StateManager()

    def execute_transaction(self, sender: str, data: dict):
        """
        Executes a transaction logic based on the 'data' payload.
        Simulates function calls to the Digitionary contract.
        """
        try:
            action = data.get("action")
            
            if action == "addWord":
                term = data.get("term", "").strip()
                content = data.get("content", "").strip()
                commit_msg = data.get("commitMsg", "Initial commit").strip()
                
                if not term or not content:
                    return {"success": False, "error": "Term and content are required"}
                
                if len(term) > 100:
                    return {"success": False, "error": "Term must be less than 100 characters"}
                    
                word_id = self.state.add_word(term, content, commit_msg, sender)
                return {"success": True, "wordId": word_id, "message": "Word created successfully"}

            elif action == "updateWord":
                word_id = data.get("wordId")
                content = data.get("content", "").strip()
                commit_msg = data.get("commitMsg", "Updated").strip()
                
                if not word_id or not content:
                    return {"success": False, "error": "Word ID and content are required"}
                
                try:
                    self.state.update_word(int(word_id), content, commit_msg, sender)
                    return {"success": True, "wordId": word_id, "message": "Word updated successfully"}
                except Exception as e:
                    return {"success": False, "error": str(e)}

            elif action == "createDictionary":
                title = data.get("title", "").strip()
                word_ids = data.get("wordIds", [])
                
                if not title:
                    return {"success": False, "error": "Dictionary title is required"}
                
                if len(word_ids) < 1:
                    return {"success": False, "error": "Dictionary must contain at least one word"}

                # Validate all word IDs exist
                for wid in word_ids:
                    if wid not in self.state.words:
                        return {"success": False, "error": f"Word ID {wid} does not exist"}

                dict_id = self.state.create_dictionary(title, word_ids, sender)
                return {"success": True, "dictionaryId": dict_id, "message": "Dictionary published successfully"}

            else:
                return {"success": False, "error": f"Unknown action: {action}"}
        
        except Exception as e:
            return {"success": False, "error": f"Transaction failed: {str(e)}"}

    def get_state(self):
        return self.state
