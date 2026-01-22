from cffi import FFI
import json

ffi = FFI()
ffi.cdef("""
char* put_blob(char* data);
char* put_tree(char* jsonEntries);
char* get_object(char* hash);
void free_string(char* s);
""")

lib = ffi.dlopen("./librepo.so")

def _str(fn, *args):
    s = fn(*args)
    if s == ffi.NULL:
        return None
    py = ffi.string(s).decode()
    lib.free_string(s)
    return py

def put_blob(data: bytes) -> str:
    return _str(lib.put_blob, ffi.new("char[]", data))

def put_tree(entries: list[dict]) -> str:
    return _str(
        lib.put_tree,
        ffi.new("char[]", json.dumps(entries).encode())
    )

def get_object(hash_: str) -> bytes | None:
    s = lib.get_object(ffi.new("char[]", hash_.encode()))
    if s == ffi.NULL:
        return None
    py = ffi.string(s)
    lib.free_string(s)
    return py
