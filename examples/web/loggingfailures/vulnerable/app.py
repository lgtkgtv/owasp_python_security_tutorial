"""
Security Logging & Monitoring Failures - VULNERABLE version.

/login logs the raw request, including the plaintext password, and never
logs failed-login attempts distinctly from successful ones - so there's
both a secret leaking into logs AND no way to detect a brute-force attack
from the log file afterward.

    curl -X POST http://localhost:8000/login -d "username=admin&password=wrong1"
    curl -X POST http://localhost:8000/login -d "username=admin&password=wrong2"
    curl -X POST http://localhost:8000/login -d "username=admin&password=hunter2"
    curl http://localhost:8000/logs

The log file contains every plaintext password ever tried, and nothing
distinguishes the 2 failed attempts from the 1 success - no incident
responder could reconstruct a brute-force attempt from this.
"""
import logging
from fastapi import FastAPI, Form

logging.basicConfig(filename="/tmp/app.log", level=logging.INFO, format="%(message)s")
logger = logging.getLogger("app")

app = FastAPI(title="Logging Failures - VULNERABLE")
VALID_PASSWORD = "hunter2"


@app.get("/")
def root():
    return {"lab": "logging-failures", "variant": "vulnerable"}


@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    # DANGEROUS: logs the raw credential, and doesn't distinguish
    # success/failure or record enough context (source IP, outcome) to be
    # useful for detecting an attack later.
    logger.info(f"login_attempt username={username} password={password}")
    ok = password == VALID_PASSWORD
    return {"success": ok}


@app.get("/logs")
def logs():
    with open("/tmp/app.log") as f:
        return {"log_lines": f.read().splitlines()}
