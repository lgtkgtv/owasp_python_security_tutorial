"""
Insecure Deserialization - VULNERABLE version.

/load accepts a base64-encoded pickle blob and unpickles it directly.
Python's pickle format can embed a __reduce__ call that runs arbitrary code
the moment it is unpickled - unpickling untrusted data is equivalent to
running it. This demo uses a harmless marker class (it just returns a
string) instead of a destructive payload, but the mechanism is exactly the
one a real attacker would abuse to execute real code:

    # A "normal" payload someone might send:
    curl -X POST http://localhost:8000/load -d "$(python3 -c "
import pickle, base64
print(base64.b64encode(pickle.dumps({'name': 'alice'})).decode())
")"

    # A malicious payload: pickling an object whose __reduce__ runs on load
    curl -X POST http://localhost:8000/load -d "$(python3 -c "
import pickle, base64
class Evil:
    def __reduce__(self):
        return (print, ('!! arbitrary code executed during unpickling !!',))
print(base64.b64encode(pickle.dumps(Evil())).decode())
")"

Check the server logs (docker compose logs) after the second request - the
print() ran server-side, purely because the object was unpickled.
"""
import base64
import pickle
from fastapi import FastAPI, Body

app = FastAPI(title="Insecure Deserialization - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "deserialization", "variant": "vulnerable"}


@app.post("/load")
def load(payload: str = Body(..., media_type="text/plain")):
    # DANGEROUS: unpickling untrusted input can execute arbitrary code via
    # a crafted __reduce__ method - there is no way to "sanitize" pickle
    # input, the format itself is the vulnerability.
    raw = base64.b64decode(payload)
    obj = pickle.loads(raw)
    return {"loaded_type": type(obj).__name__, "value": repr(obj)}
