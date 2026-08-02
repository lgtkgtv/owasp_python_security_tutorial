"""
Misinformation - SECURE-ish version.

Same /ask endpoint, but the mock model only answers from a small, known
knowledge base and explicitly admits uncertainty for anything outside it,
instead of fabricating a plausible-sounding answer.

    curl "http://localhost:8000/ask?question=Is%20quantum%20flux%20annealing%20safe%20for%20humans%3F"
    curl "http://localhost:8000/ask?question=What%20is%20Python%3F"
"""
from fastapi import FastAPI
from mock_llm import mock_answer_grounded

app = FastAPI(title="Misinformation - SECURE")


@app.get("/")
def root():
    return {"lab": "misinformation", "variant": "secure"}


@app.get("/ask")
def ask(question: str):
    # SAFE: grounded in a known knowledge base - admits uncertainty rather
    # than fabricating detail for topics outside it.
    return {"answer": mock_answer_grounded(question)}
