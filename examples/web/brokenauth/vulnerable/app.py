"""
Broken Authentication (predictable session tokens) - VULNERABLE version.

Issues short, sequential integer session tokens. Try:

    curl -X POST http://localhost:8000/login -d "username=alice"
    curl -X POST http://localhost:8000/login -d "username=bob"

Notice the token is just the previous one plus one - an attacker who sees
token 1001 can simply guess 1002, 1003, ... and hijack other sessions
without ever seeing a password.
"""
from fastapi import FastAPI, Form

app = FastAPI(title="Broken Authentication - VULNERABLE")

_next_token = 1001
SESSIONS = {}


@app.get("/")
def root():
    return {"lab": "broken-auth", "variant": "vulnerable"}


@app.post("/login")
def login(username: str = Form(...)):
    global _next_token
    token = str(_next_token)
    _next_token += 1
    SESSIONS[token] = username
    return {"session_token": token, "hint": "tokens are sequential - try guessing the next one"}


@app.get("/whoami")
def whoami(session_token: str):
    user = SESSIONS.get(session_token)
    if not user:
        return {"error": "invalid session"}
    return {"username": user}
