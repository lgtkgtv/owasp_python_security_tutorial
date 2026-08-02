"""
Improper Output Handling - VULNERABLE version.

/chat-page renders the mock LLM's reply directly into an HTML page with no
escaping - the same XSS problem the web track's XSS module teaches, just
sourced from model output instead of a search box. If a prompt can
convince the model to include a <script> tag in its reply (an attacker
might do this via prompt injection, or the reply might simply echo
attacker-supplied text the model was asked to summarize), that tag runs in
the browser of anyone who views the page.

    curl "http://localhost:8000/chat-page?message=<script>alert(1)</script>"

The mock model here just echoes suspicious-looking input back (standing in
for "the model was tricked into including this in its answer") so the
response HTML contains the live, unescaped <script> tag.
"""
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Improper Output Handling - VULNERABLE")


@app.get("/")
def root():
    return {"lab": "output-handling", "variant": "vulnerable", "try": "/chat-page?message=<script>alert(1)</script>"}


@app.get("/chat-page", response_class=HTMLResponse)
def chat_page(message: str = "Hello"):
    # Simulate the model including attacker-influenced text in its answer.
    model_reply = f"Here's what you asked about: {message}"
    # DANGEROUS: rendered directly into HTML with no escaping.
    return f"<html><body><h1>Assistant</h1><p>{model_reply}</p></body></html>"
