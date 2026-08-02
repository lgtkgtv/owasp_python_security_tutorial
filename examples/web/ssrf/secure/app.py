"""
SSRF - SECURE version.

Same /fetch feature, but the target URL is validated against an allowlist
of hosts before the request is made, and private/loopback IP ranges are
blocked outright even if a hostname resolves to one.

    curl "http://localhost:8000/fetch?url=http://127.0.0.1:9000/internal-only"
    # -> rejected: loopback/private address blocked

    curl "http://localhost:8000/fetch?url=https://example.com/allowed"
    # not actually reachable in this sandbox, but shown for contrast: only
    # explicitly allowlisted hosts would even be attempted
"""
import ipaddress
import socket
from urllib.parse import urlparse
import httpx
from fastapi import FastAPI

app = FastAPI(title="SSRF - SECURE")

ALLOWED_HOSTS = {"example.com", "api.example.com"}


@app.get("/")
def root():
    return {"lab": "ssrf", "variant": "secure", "try": "/fetch?url=http://127.0.0.1:9000/internal-only"}


@app.get("/internal-only")
def internal_only():
    return {"secret": "internal admin data that should never be internet-reachable"}


def is_private(host: str) -> bool:
    try:
        for info in socket.getaddrinfo(host, None):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return True
        return False
    except socket.gaierror:
        return True  # can't resolve -> treat as unsafe, refuse


@app.get("/fetch")
def fetch(url: str):
    parsed = urlparse(url)
    host = parsed.hostname or ""
    # SAFE #1: allowlist - only known-good destinations are ever attempted.
    if host not in ALLOWED_HOSTS:
        return {"error": f"host {host!r} is not on the allowlist - request rejected"}
    # SAFE #2: defense in depth - block private/loopback/link-local
    # addresses even for allowlisted-looking hostnames (DNS rebinding).
    if is_private(host):
        return {"error": f"host {host!r} resolves to a private/internal address - request rejected"}
    resp = httpx.get(url, timeout=3)
    return {"requested_url": url, "status": resp.status_code, "body": resp.text}
