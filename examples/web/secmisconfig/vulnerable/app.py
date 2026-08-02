"""
Security Misconfiguration - VULNERABLE version.

Bundles three common misconfigurations in one small app:
  1. debug=True, which turns unhandled exceptions into a full stack trace
     returned to the caller (leaks file paths, code, sometimes secrets).
  2. Wide-open CORS (Access-Control-Allow-Origin: *) on an endpoint that
     returns account data - any website can read it via client-side JS.
  3. An unauthenticated "admin" endpoint that dumps environment variables.

    curl "http://localhost:8000/crash"                # full traceback leaks
    curl -i "http://localhost:8000/account"            # note the CORS header
    curl "http://localhost:8000/admin/env"             # no auth required
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Security Misconfiguration - VULNERABLE", debug=True)

# DANGEROUS #1: allow_origins=["*"] means literally any website's
# JavaScript can read this API's responses from a logged-in user's browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.environ.setdefault("DB_PASSWORD", "super-secret-db-password")


@app.get("/")
def root():
    return {"lab": "security-misconfiguration", "variant": "vulnerable"}


@app.get("/account")
def account():
    return {"username": "alice", "plan": "pro"}


@app.get("/crash")
def crash():
    # DANGEROUS #2: with debug=True, this unhandled exception's full
    # traceback (file paths, source lines) is returned to the client.
    return 1 / 0


@app.get("/admin/env")
def admin_env():
    # DANGEROUS #3: no authentication at all on an endpoint that dumps
    # process environment variables, including secrets.
    return dict(os.environ)
