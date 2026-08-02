"""
Unbounded Consumption - SECURE version.

Same /generate endpoint, but with three concrete limits: a max prompt
length, a max repeat/output size, and a simple per-process rate limit.

    curl "http://localhost:8000/generate?prompt=hi&repeat=1000000"
    # -> rejected: repeat exceeds the maximum allowed

    for i in 1 2 3 4 5 6; do curl "http://localhost:8000/generate?prompt=hi&repeat=2"; done
    # -> after the limit, further requests in the same window are rejected
"""
import time
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Unbounded Consumption - SECURE")

MAX_PROMPT_LENGTH = 200
MAX_REPEAT = 50
RATE_LIMIT_WINDOW_SECONDS = 10
RATE_LIMIT_MAX_REQUESTS = 5

_request_log = []  # timestamps of recent requests (simple in-memory limiter)


def check_rate_limit():
    now = time.time()
    while _request_log and now - _request_log[0] > RATE_LIMIT_WINDOW_SECONDS:
        _request_log.pop(0)
    if len(_request_log) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="rate limit exceeded - slow down")
    _request_log.append(now)


@app.get("/")
def root():
    return {"lab": "unbounded-consumption", "variant": "secure", "try": "/generate?prompt=hi&repeat=1000000"}


@app.get("/generate")
def generate(prompt: str, repeat: int = 1):
    check_rate_limit()
    # SAFE: explicit caps on both input and output size.
    if len(prompt) > MAX_PROMPT_LENGTH:
        raise HTTPException(status_code=400, detail=f"prompt exceeds max length of {MAX_PROMPT_LENGTH}")
    if repeat > MAX_REPEAT:
        raise HTTPException(status_code=400, detail=f"repeat exceeds max of {MAX_REPEAT}")
    output = (prompt + " ") * repeat
    return {"prompt_length": len(prompt), "repeat": repeat, "output_length": len(output)}
