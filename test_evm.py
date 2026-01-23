from evm.execution.evm import EVM
import json

def test_evm():
    evm = EVM()
    sender = "0xDevUser"
    
    # 1. Add Word
    print("Testing Add Word...")
    res = evm.execute_transaction(sender, {
        "action": "addWord",
        "term": "Test",
        "content": "Desc",
        "commitMsg": "Init"
    })
    print(res)
    assert res["success"] == True
    word_id = res["wordId"]
    
    # 2. Create Dictionary Logic
    print("Testing Create Dictionary...")
    res = evm.execute_transaction(sender, {
        "action": "createDictionary",
        "title": "My Dict",
        "wordIds": [word_id]
    })
    print(res)
    assert res["success"] == True
    
    # 3. Create Dictionary Empty (Force Fail)
    print("Testing Create Dictionary (Empty)...")
    res = evm.execute_transaction(sender, {
        "action": "createDictionary",
        "title": "Empty Dict",
        "wordIds": []
    })
    print(res)
    assert res["success"] == False
    assert res["error"] == "Dictionary must contain words"
    
    print("All tests passed!")

if __name__ == "__main__":
    test_evm()
