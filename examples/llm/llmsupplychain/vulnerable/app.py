"""
LLM Supply Chain - VULNERABLE version.

/model-info reports which model artifact this service would load, pulled
from an "unpinned" reference (a mutable "latest" tag with no integrity
check) - exactly the pattern that lets a compromised upstream model
registry silently swap in a malicious or backdoored model without the
deploying team ever noticing a version actually changed.

    curl http://localhost:8000/model-info
"""
from fastapi import FastAPI

app = FastAPI(title="LLM Supply Chain - VULNERABLE")

# DANGEROUS: "latest" is a moving target with no integrity guarantee - the
# artifact behind this tag can change at any time, and there is no hash
# pinning it to a specific, reviewed model version.
MODEL_REFERENCE = {
    "registry": "example-model-hub.internal",
    "name": "support-assistant",
    "tag": "latest",
    "sha256": None,
}


@app.get("/")
def root():
    return {"lab": "llm-supply-chain", "variant": "vulnerable"}


@app.get("/model-info")
def model_info():
    return {
        "model_reference": MODEL_REFERENCE,
        "risk": "tag is mutable and unpinned - the actual model behind 'latest' can change without review",
    }
