"""
LLM Supply Chain - SECURE version.

Same /model-info endpoint, but the model reference is pinned to an
immutable, specific version *and* a sha256 digest that's verified before
the (simulated) model is loaded - matching how container image digests or
package hashes pin a supply chain in other ecosystems.

    curl http://localhost:8000/model-info
"""
from fastapi import FastAPI

app = FastAPI(title="LLM Supply Chain - SECURE")

# SAFE: a specific, immutable version plus a digest that would be verified
# against the downloaded artifact before it's ever loaded.
MODEL_REFERENCE = {
    "registry": "example-model-hub.internal",
    "name": "support-assistant",
    "tag": "v2.3.1",
    "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
}


@app.get("/")
def root():
    return {"lab": "llm-supply-chain", "variant": "secure"}


@app.get("/model-info")
def model_info():
    return {
        "model_reference": MODEL_REFERENCE,
        "verified": True,
        "note": "pinned to an exact version + digest - a registry compromise can't silently swap this out",
    }
