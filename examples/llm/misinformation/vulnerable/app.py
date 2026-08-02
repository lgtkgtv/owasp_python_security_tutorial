"""
Misinformation - VULNERABLE version.

/ask always answers confidently, even about topics the mock model has no
real knowledge of - fabricating specific-sounding statistics and dates
rather than admitting uncertainty.

    curl "http://localhost:8000/ask?question=Is%20quantum%20flux%20annealing%20safe%20for%20humans%3F"

The reply invents a confident, detailed-sounding answer about a made-up
topic - exactly the failure mode that makes LLM-generated misinformation
dangerous: it doesn't *sound* uncertain even when it has no grounding.
"""
from fastapi import FastAPI
from mock_llm import mock_answer_unbounded

app = FastAPI(title="Misinformation - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "misinformation", "variant": "vulnerable"}


@app.get("/ask")
def ask(question: str):
    # DANGEROUS: always produces a confident answer, never signals when
    # the topic is outside what it actually knows.
    return {"answer": mock_answer_unbounded(question)}
