"""
Reflected XSS - SECURE version.

Same endpoint, but the query is HTML-escaped before being placed in the
page. Try the exact same requests as the vulnerable app:

    curl "http://localhost:8000/search?q=<script>alert(1)</script>"

The response now contains "&lt;script&gt;" - inert text, not a real tag -
so a browser would display it as literal text instead of running it.
"""
import html
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Reflected XSS - SECURE")


@app.get("/")
def root():
    return {"lab": "xss", "variant": "secure", "try": "/search?q=<script>alert(1)</script>"}


@app.get("/search", response_class=HTMLResponse)
def search(q: str = ""):
    # SAFE: escape before embedding in HTML - <, >, ", ' all become entities.
    safe_q = html.escape(q)
    return f"<html><body><h1>Search Results</h1><p>You searched for: {safe_q}</p></body></html>"
