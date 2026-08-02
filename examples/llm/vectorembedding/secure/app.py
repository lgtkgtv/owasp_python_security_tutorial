"""
Vector/Embedding Weaknesses - SECURE version.

Same shared index, but results are filtered to only the requesting
tenant's own documents before anything is returned - the access-control
check that real RAG deployments must apply *after* retrieval (since the
vector similarity search itself has no concept of authorization).

    curl "http://localhost:8000/rag-search?q=roadmap&tenant=acme"

Only Acme's own roadmap document comes back - Globex's confidential
document is filtered out before the response is built, not just hidden
after the fact.
"""
from fastapi import FastAPI

app = FastAPI(title="Vector/Embedding Weaknesses - SECURE")

DOCUMENTS = [
    {"tenant": "acme", "title": "Acme Q3 roadmap", "text": "Acme is launching feature X in Q3."},
    {"tenant": "globex", "title": "Globex Q3 roadmap (CONFIDENTIAL)", "text": "Globex is planning layoffs in Q3."},
    {"tenant": "acme", "title": "Acme onboarding guide", "text": "Welcome to Acme! Here's how to get started."},
]


@app.get("/")
def root():
    return {"lab": "vector-embedding", "variant": "secure", "try": "/rag-search?q=roadmap&tenant=acme"}


@app.get("/rag-search")
def rag_search(q: str, tenant: str):
    # SAFE: filter to the requesting tenant's own documents BEFORE
    # returning anything - retrieval relevance and authorization are two
    # separate checks, and both must pass.
    tenant_docs = [d for d in DOCUMENTS if d["tenant"] == tenant]
    matches = [d for d in tenant_docs if q.lower() in d["text"].lower() or q.lower() in d["title"].lower()]
    return {"requesting_tenant": tenant, "results": matches}
