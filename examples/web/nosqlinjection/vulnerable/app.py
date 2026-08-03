"""NoSQL Injection (OWASP A03:2021, CWE-943) -- VULNERABLE variant.

No real MongoDB server is used here (this lab runs standalone in a
container with no external services). Instead, MOCK_DB and match_filter()
implement a small, faithful subset of MongoDB's query-filter semantics
($ne, $gt, $gte, $regex, $exists) -- enough to demonstrate the real
vulnerability mechanism: a user-supplied JSON value is passed straight into
a query filter with no check that it's the plain string the code expects.

⚠️ VULNERABLE - DO NOT USE IN PRODUCTION.
"""
import re

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

MOCK_DB = [
    {"username": "admin", "password": "secret123", "email": "admin@example.com"},
]


def match_filter(doc_value, filter_value):
    """Mimics MongoDB's filter matching for the operators this lab covers.
    A plain (non-dict) filter_value means exact equality, same as MongoDB."""
    if not isinstance(filter_value, dict):
        return doc_value == filter_value

    for op, operand in filter_value.items():
        if op == "$ne":
            if doc_value == operand:
                return False
        elif op == "$gt":
            if not (isinstance(doc_value, str) and isinstance(operand, str) and doc_value > operand):
                return False
        elif op == "$gte":
            if not (isinstance(doc_value, str) and isinstance(operand, str) and doc_value >= operand):
                return False
        elif op == "$regex":
            if not re.fullmatch(operand, doc_value or ""):
                return False
        elif op == "$exists":
            exists = doc_value is not None
            if exists != bool(operand):
                return False
        else:
            # Unknown operator: fail closed for this mock, same as a real
            # driver would reject an operator it doesn't recognize.
            return False
    return True


class LoginRequest(BaseModel):
    username: object
    password: object


@app.get("/")
async def root():
    return {
        "lab": "nosql-injection",
        "variant": "vulnerable",
        "try": 'curl -X POST http://localhost:8000/login -H "Content-Type: application/json" '
               '-d \'{"username":"admin","password":{"$ne":null}}\'',
    }


@app.post("/login")
async def login(credentials: LoginRequest):
    """⚠️ VULNERABLE - the JSON body's fields are passed straight into the
    query filter with no check that they're plain strings. A dict like
    {"$ne": null} is accepted and interpreted as a query operator."""
    for user in MOCK_DB:
        if match_filter(user["username"], credentials.username) and \
           match_filter(user["password"], credentials.password):
            return {"authenticated": True, "user": user["username"]}
    return {"authenticated": False}
