"""
Vector and Embedding Weaknesses - VULNERABLE version.

/rag-search simulates a shared vector store backing a RAG (retrieval-
augmented generation) system, but returns matching documents from *every*
tenant, regardless of who's asking.

    curl "http://localhost:8000/rag-search?q=roadmap&tenant=acme"

A search from "acme" returns "globex"'s private roadmap document too - the
retrieval step never filtered by which tenant is allowed to see which
document, so anything in the shared index is reachable by anyone who can
query it.
"""
from fastapi import FastAPI

app = FastAPI(title="Vector/Embedding Weaknesses - VULNERABLE")

# A shared "vector store" - every tenant's documents live in one index.
DOCUMENTS = [
    {"tenant": "acme", "title": "Acme Q3 roadmap", "text": "Acme is launching feature X in Q3."},
    {"tenant": "globex", "title": "Globex Q3 roadmap (CONFIDENTIAL)", "text": "Globex is planning layoffs in Q3."},
    {"tenant": "acme", "title": "Acme onboarding guide", "text": "Welcome to Acme! Here's how to get started."},
]


@app.get("/")
def root():
    return {"lab": "vector-embedding", "variant": "vulnerable", "try": "/rag-search?q=roadmap&tenant=acme"}


@app.get("/rag-search")
def rag_search(q: str, tenant: str):
    # DANGEROUS: "search" (simulated here as a substring match standing in
    # for a real embedding similarity search) runs across the entire
    # shared index with no per-tenant access filter.
    matches = [d for d in DOCUMENTS if q.lower() in d["text"].lower() or q.lower() in d["title"].lower()]
    return {"requesting_tenant": tenant, "results": matches}
