"""
Broken Access Control (IDOR) - SECURE version.

Same endpoint, but it checks that the requesting user (X-User-Id) actually
owns the invoice before returning anything.

    curl -H "X-User-Id: 101" http://localhost:8000/invoices/1001   # own invoice - OK
    curl -H "X-User-Id: 101" http://localhost:8000/invoices/2001   # someone else's - 403
"""
from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Broken Access Control (IDOR) - SECURE")

INVOICES = {
    1001: {"owner_id": 101, "amount": "$120.00"},
    1002: {"owner_id": 101, "amount": "$45.50"},
    2001: {"owner_id": 202, "amount": "$4,812.00", "customer_name": "Jordan Alvarez"},
}


@app.get("/")
def root():
    return {"lab": "broken-access-control", "variant": "secure", "try": "X-User-Id: 101, /invoices/2001"}


@app.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, x_user_id: int = Header(default=101)):
    invoice = INVOICES.get(invoice_id)
    if not invoice:
        return {"error": "not found"}
    # SAFE: verify the authenticated user actually owns this record before
    # returning it - on every request, not just at login time.
    if invoice["owner_id"] != x_user_id:
        raise HTTPException(status_code=403, detail="you do not own this invoice")
    return {"invoice_id": invoice_id, **invoice}
