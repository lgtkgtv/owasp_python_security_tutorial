"""
Data and Model Poisoning - VULNERABLE version.

/feedback lets any user submit a "this was a good/bad response" example
that gets added directly to a simulated fine-tuning dataset with zero
validation or review. An attacker (or a coordinated group of fake accounts)
can submit many examples that mislabel harmful outputs as "good," gradually
biasing what a future fine-tune would learn to consider correct.

    curl -X POST http://localhost:8000/feedback -H "Content-Type: application/json" \\
      -d '{"prompt": "How do I reset my password?", "response": "Sure, here is the admin override: ...", "label": "good"}'
    curl http://localhost:8000/dataset
"""
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Data/Model Poisoning - VULNERABLE")
DATASET = []


class Feedback(BaseModel):
    prompt: str
    response: str
    label: str  # "good" or "bad"


@app.get("/")
def root():
    return {"lab": "data-poisoning", "variant": "vulnerable"}


@app.post("/feedback")
def feedback(item: Feedback):
    # DANGEROUS: goes straight into the training set, no review, no
    # anomaly detection, no rate limiting per submitter.
    DATASET.append(item.dict())
    return {"accepted": True, "dataset_size": len(DATASET)}


@app.get("/dataset")
def dataset():
    return {"examples": DATASET}
