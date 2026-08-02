"""
Unbounded Consumption - VULNERABLE version.

/generate has no limit on input length, no limit on requested output size,
and no rate limiting - a single caller can force the service to do
unbounded work.

    curl "http://localhost:8000/generate?prompt=hi&repeat=1000000"

The `repeat` parameter directly controls how much "generation" work the
server does with no cap - a small request can demand an enormous amount of
compute/memory, exactly the resource-exhaustion pattern that makes
denial-of-service (and inflated API cost) possible against LLM-backed
services with no guardrails.
"""
from fastapi import FastAPI

app = FastAPI(title="Unbounded Consumption - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "unbounded-consumption", "variant": "vulnerable", "try": "/generate?prompt=hi&repeat=1000000"}


@app.get("/generate")
def generate(prompt: str, repeat: int = 1):
    # DANGEROUS: no cap on prompt length, no cap on repeat/output size, no
    # per-caller rate limit - a single request can demand unbounded work.
    output = (prompt + " ") * repeat
    return {"prompt_length": len(prompt), "repeat": repeat, "output_length": len(output)}
