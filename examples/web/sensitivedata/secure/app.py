"""
Sensitive Data Exposure - SECURE version.

Same registration flow, but the password is hashed with bcrypt (via
passlib) - slow-by-design and automatically salted, so identical passwords
produce different hashes and brute-forcing is computationally expensive.
The hash is also never returned in any API response.

    curl -X POST http://localhost:8000/register -d "username=alice&password=hunter2"
    curl http://localhost:8000/users/alice
"""
from fastapi import FastAPI, Form
from passlib.hash import bcrypt

app = FastAPI(title="Sensitive Data Exposure - SECURE")
USERS = {}


@app.get("/")
def root():
    return {"lab": "sensitive-data", "variant": "secure"}


@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):
    # SAFE: bcrypt is slow-by-design and salts automatically - the same
    # password produces a different hash every time it's registered.
    USERS[username] = bcrypt.hash(password)
    # SAFE: the hash is never included in the response at all.
    return {"username": username, "status": "registered"}


@app.get("/users/{username}")
def get_user(username: str):
    exists = username in USERS
    return {"username": username, "exists": exists}
