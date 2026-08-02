"""
Reflected XSS - VULNERABLE version.

A "search" endpoint reflects the query string straight back into an HTML
page with no escaping. Try:

    curl "http://localhost:8000/search?q=hello"
    curl "http://localhost:8000/search?q=<script>alert(1)</script>"

In the second response, the <script> tag comes back completely intact in
the HTML body - if a real browser rendered this page, it would execute.
"""
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Reflected XSS - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "xss", "variant": "vulnerable", "try": "/search?q=<script>alert(1)</script>"}


@app.get("/search", response_class=HTMLResponse)
def search(q: str = ""):
    # DANGEROUS: user input dropped directly into the HTML body.
    return f"<html><body><h1>Search Results</h1><p>You searched for: {q}</p></body></html>"
