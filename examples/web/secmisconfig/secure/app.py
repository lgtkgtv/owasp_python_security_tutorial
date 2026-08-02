"""
Security Misconfiguration - SECURE version.

Fixes all three issues from the vulnerable app:
  1. debug=False (the default) - unhandled exceptions return a generic
     500 with no stack trace or internal details.
  2. CORS restricted to an explicit allowlist of trusted origins.
  3. The admin endpoint requires a bearer token before returning anything.

    curl "http://localhost:8000/crash"                       # generic 500, no traceback
    curl -i "http://localhost:8000/account"                    # no wildcard CORS header
    curl "http://localhost:8000/admin/env"                     # 401
    curl -H "Authorization: Bearer admin-demo-token" \\
      "http://localhost:8000/admin/env"                        # 200, only after auth
"""
import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Security Misconfiguration - SECURE", debug=False)

# SAFE #1: explicit allowlist instead of "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trusted-frontend.example.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["Authorization", "Content-Type"],
)

os.environ.setdefault("DB_PASSWORD", "super-secret-db-password")
ADMIN_TOKEN = "admin-demo-token"  # in a real app: a secrets manager, not a literal


@app.get("/")
def root():
    return {"lab": "security-misconfiguration", "variant": "secure"}


@app.get("/account")
def account():
    return {"username": "alice", "plan": "pro"}


@app.get("/crash")
def crash():
    # SAFE #2: debug=False means FastAPI/Starlette returns a generic
    # "Internal Server Error" with no traceback or source details.
    return 1 / 0


@app.get("/admin/env")
def admin_env(authorization: str = Header(default=None)):
    # SAFE #3: require a valid bearer token before returning anything.
    if authorization != f"Bearer {ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="unauthorized")
    return dict(os.environ)
