"""
Improper Output Handling - SECURE version.

Same page, but the model's reply is HTML-escaped before being embedded in
the page - exactly the fix from the XSS module, applied to model output
instead of user search input, because from a rendering perspective they're
the same kind of untrusted string.

    curl "http://localhost:8000/chat-page?message=<script>alert(1)</script>"

The response now contains "&lt;script&gt;" - inert text.
"""
import html
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Improper Output Handling - SECURE")


@app.get("/")
def root():
    return {"lab": "output-handling", "variant": "secure", "try": "/chat-page?message=<script>alert(1)</script>"}


@app.get("/chat-page", response_class=HTMLResponse)
def chat_page(message: str = "Hello"):
    model_reply = f"Here's what you asked about: {message}"
    # SAFE: escape model output before embedding in HTML, same as any
    # other untrusted string.
    safe_reply = html.escape(model_reply)
    return f"<html><body><h1>Assistant</h1><p>{safe_reply}</p></body></html>"
