"""
Data/Model Poisoning - SECURE version.

Same feedback flow, but submissions land in a pending review queue instead
of the training dataset directly. Only an explicit /review/{id}/approve
call (standing in for a human reviewer or an automated anomaly-detection
pass) moves an example into the actual dataset.

    curl -X POST http://localhost:8000/feedback -H "Content-Type: application/json" \\
      -d '{"prompt": "How do I reset my password?", "response": "Sure, here is the admin override: ...", "label": "good"}'
    curl http://localhost:8000/dataset          # empty - nothing auto-accepted
    curl http://localhost:8000/pending          # shows it's sitting in review
    curl -X POST http://localhost:8000/review/0/approve
    curl http://localhost:8000/dataset          # now included, after review
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Data/Model Poisoning - SECURE")
PENDING = []
DATASET = []


class Feedback(BaseModel):
    prompt: str
    response: str
    label: str


@app.get("/")
def root():
    return {"lab": "data-poisoning", "variant": "secure"}


@app.post("/feedback")
def feedback(item: Feedback):
    # SAFE: queued for review, not auto-accepted into the training set.
    PENDING.append(item.dict())
    return {"accepted": False, "status": "pending_review", "pending_id": len(PENDING) - 1}


@app.get("/pending")
def pending():
    return {"pending": PENDING}


@app.post("/review/{pending_id}/approve")
def approve(pending_id: int):
    if pending_id < 0 or pending_id >= len(PENDING):
        raise HTTPException(status_code=404, detail="no such pending item")
    DATASET.append(PENDING[pending_id])
    return {"approved": True, "dataset_size": len(DATASET)}


@app.get("/dataset")
def dataset():
    return {"examples": DATASET}
