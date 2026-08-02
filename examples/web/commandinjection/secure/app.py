"""
Command Injection - SECURE version.

Same /ping endpoint, but the host is validated against a strict allowlist
pattern (hostname/IP characters only) and the command is run as an argument
list with shell=False, so there is no shell to interpret metacharacters.

    curl "http://localhost:8000/ping?host=127.0.0.1"
    curl "http://localhost:8000/ping?host=127.0.0.1;%20echo%20PWNED"

The second request is now rejected outright by the input validation, before
subprocess ever runs - and even if validation were skipped, shell=False with
an argument list means ";" would just be an invalid character in a hostname,
never a command separator.
"""
import re
import subprocess
from fastapi import FastAPI

app = FastAPI(title="Command Injection - SECURE")

# Only allow characters that are valid in a hostname or IPv4 address.
HOST_PATTERN = re.compile(r"^[A-Za-z0-9.\-]+$")


@app.get("/")
def root():
    return {"lab": "command-injection", "variant": "secure", "try": "/ping?host=127.0.0.1; echo PWNED"}


@app.get("/ping")
def ping(host: str):
    # SAFE #1: strict allowlist validation rejects shell metacharacters.
    if not HOST_PATTERN.match(host):
        return {"error": f"invalid host {host!r} - rejected before running any command"}
    # SAFE #2: argument list + shell=False - no shell parses the string,
    # so there are no metacharacters to exploit even in principle.
    result = subprocess.run(
        ["ping", "-c", "1", "-W", "1", host], shell=False, capture_output=True, text=True, timeout=5
    )
    return {"command_run": ["ping", "-c", "1", "-W", "1", host], "stdout": result.stdout, "stderr": result.stderr}
