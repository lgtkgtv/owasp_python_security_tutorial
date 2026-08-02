"""
CSRF (Cross-Site Request Forgery) - VULNERABLE version.

A state-changing endpoint (transfer money) trusts a session cookie alone,
with no CSRF token check. Simulate a logged-in user first, then simulate a
malicious cross-site form submitting on their behalf using only the cookie:

    curl -c cookies.txt -X POST http://localhost:8000/login -d "username=alice"
    curl -b cookies.txt -X POST http://localhost:8000/transfer -d "to=attacker&amount=500"

The transfer succeeds with only the cookie attached - exactly what a
malicious page on another site could trigger from a victim's browser
without the victim ever knowing.
"""
from fastapi import FastAPI, Form, Response, Cookie
import secrets

app = FastAPI(title="CSRF - VULNERABLE")

SESSIONS = {}
BALANCES = {"alice": 1000}


@app.get("/")
def root():
    return {"lab": "csrf", "variant": "vulnerable"}


@app.post("/login")
def login(response: Response, username: str = Form(...)):
    session_id = secrets.token_urlsafe(16)
    SESSIONS[session_id] = username
    response.set_cookie("session_id", session_id)
    return {"logged_in_as": username}


@app.post("/transfer")
def transfer(to: str = Form(...), amount: int = Form(...), session_id: str = Cookie(default=None)):
    user = SESSIONS.get(session_id)
    if not user:
        return {"error": "not logged in"}
    # DANGEROUS: no CSRF token checked - the cookie alone authorizes this
    # state-changing action, and cookies are sent automatically by the
    # browser even for requests originating from a different site.
    BALANCES[user] = BALANCES.get(user, 0) - amount
    return {"transferred": amount, "to": to, "new_balance": BALANCES[user]}
