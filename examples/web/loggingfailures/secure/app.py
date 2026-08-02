"""
Security Logging & Monitoring Failures - SECURE version.

Same login flow, but the log entry never contains the password, and does
record the outcome (success/failure) plus enough context (username, a
reason code) to actually detect a brute-force pattern afterward.

    curl -X POST http://localhost:8000/login -d "username=admin&password=wrong1"
    curl -X POST http://localhost:8000/login -d "username=admin&password=wrong2"
    curl -X POST http://localhost:8000/login -d "username=admin&password=hunter2"
    curl http://localhost:8000/logs
"""
import logging
from fastapi import FastAPI, Form

logging.basicConfig(filename="/tmp/app_secure.log", level=logging.INFO, format="%(message)s")
logger = logging.getLogger("app")

app = FastAPI(title="Logging Failures - SECURE")
VALID_PASSWORD = "hunter2"


@app.get("/")
def root():
    return {"lab": "logging-failures", "variant": "secure"}


@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    ok = password == VALID_PASSWORD
    # SAFE: never log the credential itself - log the security-relevant
    # outcome and context needed to detect abuse instead.
    if ok:
        logger.info(f"login_success username={username}")
    else:
        logger.info(f"login_failed username={username} reason=invalid_password")
    return {"success": ok}


@app.get("/logs")
def logs():
    with open("/tmp/app_secure.log") as f:
        return {"log_lines": f.read().splitlines()}
