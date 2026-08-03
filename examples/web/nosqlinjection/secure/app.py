"""NoSQL Injection (OWASP A03:2021, CWE-943) -- SECURE variant.

Same mock in-memory "database" as the vulnerable variant (no real MongoDB
server -- this lab runs standalone). The fix is a type check: reject the
request outright if username/password aren't plain strings, before they
ever reach the query filter. A dict like {"$ne": null} can then never be
interpreted as a query operator.

✅ SECURE.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

MOCK_DB = [
    {"username": "admin", "password": "secret123", "email": "admin@example.com"},
]


class LoginRequest(BaseModel):
    username: object
    password: object


@app.get("/")
async def root():
    return {
        "lab": "nosql-injection",
        "variant": "secure",
        "try": 'curl -X POST http://localhost:8000/login -H "Content-Type: application/json" '
               '-d \'{"username":"admin","password":{"$ne":null}}\'',
    }


@app.post("/login")
async def login(credentials: LoginRequest):
    """✅ SECURE - rejects anything that isn't a plain string before it
    ever reaches the query filter."""
    if not isinstance(credentials.username, str) or not isinstance(credentials.password, str):
        raise HTTPException(status_code=400, detail="Invalid credentials format")

    for user in MOCK_DB:
        if user["username"] == credentials.username and user["password"] == credentials.password:
            return {"authenticated": True, "user": user["username"]}
    return {"authenticated": False}
