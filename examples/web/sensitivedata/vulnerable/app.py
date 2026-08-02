"""
Sensitive Data Exposure - VULNERABLE version.

/register stores the password in plaintext (well, an unsalted MD5 hash -
"encryption theater" that looks like security but isn't) and, worse,
echoes it straight back in the API response.

    curl -X POST http://localhost:8000/register -d "username=alice&password=hunter2"
    curl http://localhost:8000/users/alice

Both responses include the password hash - and MD5 with no salt is fast
enough to brute-force or reverse via rainbow tables in seconds for common
passwords, so this is barely better than storing it in plaintext.
"""
import hashlib
from fastapi import FastAPI, Form

app = FastAPI(title="Sensitive Data Exposure - VULNERABLE")
USERS = {}


@app.get("/")
def root():
    return {"lab": "sensitive-data", "variant": "vulnerable"}


@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):
    # DANGEROUS: unsalted MD5 is fast and has known rainbow tables - this
    # is "hashing" in name only, not a real defense.
    weak_hash = hashlib.md5(password.encode()).hexdigest()
    USERS[username] = weak_hash
    # DANGEROUS: returning the hash to the client at all - it should never
    # leave the server once computed.
    return {"username": username, "password_hash": weak_hash}


@app.get("/users/{username}")
def get_user(username: str):
    return {"username": username, "password_hash": USERS.get(username, "not found")}
