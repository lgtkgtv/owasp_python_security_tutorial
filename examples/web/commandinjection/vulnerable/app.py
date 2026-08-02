"""
Command Injection - VULNERABLE version.

/ping?host=... builds a shell command by string concatenation and runs it
with shell=True. Try:

    curl "http://localhost:8000/ping?host=127.0.0.1"
    curl "http://localhost:8000/ping?host=127.0.0.1;%20echo%20PWNED"

The second request appends "; echo PWNED" - the shell treats ";" as a
command separator, so it runs `echo PWNED` right after the ping, proving
arbitrary commands can be chained onto the intended one.
"""
import subprocess
from fastapi import FastAPI

app = FastAPI(title="Command Injection - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "command-injection", "variant": "vulnerable", "try": "/ping?host=127.0.0.1; echo PWNED"}


@app.get("/ping")
def ping(host: str):
    # DANGEROUS: string-built shell command, shell=True lets ; | & etc.
    # act as shell metacharacters instead of literal text.
    command = f"ping -c 1 -W 1 {host}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=5)
    return {"command_run": command, "stdout": result.stdout, "stderr": result.stderr}
