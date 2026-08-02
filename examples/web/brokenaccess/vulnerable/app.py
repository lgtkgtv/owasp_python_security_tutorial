"""
Broken Access Control (IDOR) - VULNERABLE version.

/invoices/{invoice_id} returns whatever invoice ID is asked for, trusting
the caller's own X-User-Id header with no check that they actually own
that invoice.

    curl -H "X-User-Id: 101" http://localhost:8000/invoices/1001   # own invoice
    curl -H "X-User-Id: 101" http://localhost:8000/invoices/2001   # someone else's!

The second request succeeds even though invoice 2001 belongs to a
different user - the endpoint never checks ownership, it just trusts
whatever ID appears in the URL.
"""
from fastapi import FastAPI, Header

app = FastAPI(title="Broken Access Control (IDOR) - VULNERABLE")

INVOICES = {
    1001: {"owner_id": 101, "amount": "$120.00"},
    1002: {"owner_id": 101, "amount": "$45.50"},
    2001: {"owner_id": 202, "amount": "$4,812.00", "customer_name": "Jordan Alvarez"},
}


@app.get("/")
def root():
    return {"lab": "broken-access-control", "variant": "vulnerable", "try": "X-User-Id: 101, /invoices/2001"}


@app.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, x_user_id: int = Header(default=101)):
    invoice = INVOICES.get(invoice_id)
    if not invoice:
        return {"error": "not found"}
    # DANGEROUS: returns the invoice regardless of whether x_user_id
    # actually matches invoice["owner_id"].
    return {"invoice_id": invoice_id, **invoice}
