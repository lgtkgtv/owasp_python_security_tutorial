"""
Broken Authentication (predictable session tokens) - SECURE version.

Same login flow, but the session token is a long, cryptographically random
string (secrets.token_urlsafe), not a sequential counter.

    curl -X POST http://localhost:8000/login -d "username=alice"
    curl -X POST http://localhost:8000/login -d "username=bob"

Each token is ~32 random bytes, URL-safe base64 encoded - there is no
pattern to guess, and knowing one token gives an attacker zero information
about any other token.
"""
import secrets
from fastapi import FastAPI, Form

app = FastAPI(title="Broken Authentication - SECURE")

SESSIONS = {}


@app.get("/")
def root():
    return {"lab": "broken-auth", "variant": "secure"}


@app.post("/login")
def login(username: str = Form(...)):
    token = secrets.token_urlsafe(32)
    SESSIONS[token] = username
    return {"session_token": token, "hint": "high-entropy random token - nothing to guess"}


@app.get("/whoami")
def whoami(session_token: str):
    user = SESSIONS.get(session_token)
    if not user:
        return {"error": "invalid session"}
    return {"username": user}
