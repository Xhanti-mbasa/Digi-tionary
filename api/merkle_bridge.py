import ctypes
import os
import json
from ctypes import c_char_p, c_void_p

# Load the shared library
lib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "merkle", "libmerkle.so")

if not os.path.exists(lib_path):
    raise FileNotFoundError(f"Shared library not found at {lib_path}. Please run 'merkle/build.sh' first.")

lib = ctypes.CDLL(lib_path)

# Define arguments and return types
lib.AddWords.argtypes = [c_char_p]
lib.AddWords.restype = c_char_p

lib.GetRoot.argtypes = []
lib.GetRoot.restype = c_char_p

lib.GetGraphJSON.argtypes = []
lib.GetGraphJSON.restype = c_char_p

lib.FreeString.argtypes = [c_char_p]
lib.FreeString.restype = None

class MerkleTree:
    @staticmethod
    def add_words(words: list[str]) -> str:
        words_str = ",".join(words).encode('utf-8')
        ptr = lib.AddWords(words_str)
        result = ctypes.string_at(ptr).decode('utf-8')
        # lib.FreeString(ptr)
        return result

    @staticmethod
    def get_root() -> str:
        ptr = lib.GetRoot()
        result = ctypes.string_at(ptr).decode('utf-8')
        # lib.FreeString(ptr)
        return result

    @staticmethod
    def get_graph() -> dict:
        ptr = lib.GetGraphJSON()
        json_str = ctypes.string_at(ptr).decode('utf-8')
        # lib.FreeString(ptr)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            return {"nodes": [], "links": []}
