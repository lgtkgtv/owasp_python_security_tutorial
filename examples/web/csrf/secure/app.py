"""
CSRF - SECURE version.

Same transfer flow, but /transfer additionally requires a CSRF token that
was issued alongside login and must be sent back as a custom header (not a
cookie, since cookies are exactly what a forged cross-site request would
still carry automatically).

    curl -c cookies.txt -X POST http://localhost:8000/login -d "username=alice"
    # response includes a csrf_token - a cross-site attacker page has no way
    # to read it (same-origin policy blocks reading the response body)

    curl -b cookies.txt -X POST http://localhost:8000/transfer -d "to=attacker&amount=500"
    # -> rejected: missing/invalid X-CSRF-Token header

    curl -b cookies.txt -X POST http://localhost:8000/transfer \\
      -H "X-CSRF-Token: <token from login>" -d "to=attacker&amount=500"
    # -> succeeds, because this is the legitimate app making the request
"""
import secrets
from fastapi import FastAPI, Form, Response, Cookie, Header

app = FastAPI(title="CSRF - SECURE")

SESSIONS = {}       # session_id -> username
CSRF_TOKENS = {}    # session_id -> csrf_token
BALANCES = {"alice": 1000}


@app.get("/")
def root():
    return {"lab": "csrf", "variant": "secure"}


@app.post("/login")
def login(response: Response, username: str = Form(...)):
    session_id = secrets.token_urlsafe(16)
    csrf_token = secrets.token_urlsafe(24)
    SESSIONS[session_id] = username
    CSRF_TOKENS[session_id] = csrf_token
    response.set_cookie("session_id", session_id)
    return {"logged_in_as": username, "csrf_token": csrf_token}


@app.post("/transfer")
def transfer(
    to: str = Form(...),
    amount: int = Form(...),
    session_id: str = Cookie(default=None),
    x_csrf_token: str = Header(default=None),
):
    user = SESSIONS.get(session_id)
    if not user:
        return {"error": "not logged in"}
    # SAFE: the cookie alone is not enough - a matching CSRF token (which a
    # forged cross-site request cannot obtain) must also be present.
    if not x_csrf_token or x_csrf_token != CSRF_TOKENS.get(session_id):
        return {"error": "missing or invalid CSRF token - request rejected"}
    BALANCES[user] = BALANCES.get(user, 0) - amount
    return {"transferred": amount, "to": to, "new_balance": BALANCES[user]}
