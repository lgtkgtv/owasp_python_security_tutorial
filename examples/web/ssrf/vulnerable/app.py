"""
Server-Side Request Forgery (SSRF) - VULNERABLE version.

/fetch?url=... makes an outbound HTTP request to whatever URL the caller
supplies, with no restriction. A public-facing "URL preview" or "webhook
tester" feature built this way lets an attacker make the *server* issue
requests to internal-only services it can reach but the attacker cannot:

    curl "http://localhost:8000/fetch?url=http://127.0.0.1:9000/internal-only"

In a real deployment, an attacker would point this at your cloud metadata
endpoint (e.g. http://169.254.169.254/...) or an internal admin panel that
has no auth because it "trusts" being unreachable from the internet.
"""
import httpx
from fastapi import FastAPI

app = FastAPI(title="SSRF - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "ssrf", "variant": "vulnerable", "try": "/fetch?url=http://127.0.0.1:9000/internal-only"}


@app.get("/internal-only")
def internal_only():
    """Stands in for an internal admin/metadata service this app can reach
    but the outside world cannot - the thing SSRF lets an attacker abuse."""
    return {"secret": "internal admin data that should never be internet-reachable"}


@app.get("/fetch")
def fetch(url: str):
    # DANGEROUS: no validation of the target - the server will happily
    # request any URL, including ones pointing at internal-only services.
    resp = httpx.get(url, timeout=3)
    return {"requested_url": url, "status": resp.status_code, "body": resp.text}
