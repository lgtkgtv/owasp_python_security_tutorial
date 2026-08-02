"""
Insecure Deserialization - SECURE version.

Same idea (accept serialized data, load it back into an object), but using
JSON instead of pickle. JSON can only ever produce plain data (dicts,
lists, strings, numbers, booleans, null) - there is no mechanism in the
JSON format for embedding executable behavior, so there is no equivalent
attack surface to close, structurally.

    curl -X POST http://localhost:8000/load -H "Content-Type: application/json" \\
      -d '{"name": "alice"}'
"""
from fastapi import FastAPI, Body

app = FastAPI(title="Insecure Deserialization - SECURE")


@app.get("/")
def root():
    return {"lab": "deserialization", "variant": "secure"}


@app.post("/load")
def load(payload: dict = Body(...)):
    # SAFE: json (which FastAPI/Pydantic parses here) has no equivalent of
    # pickle's __reduce__ - deserializing it can only ever produce inert
    # data, never trigger code execution.
    return {"loaded_type": "dict", "value": payload}
