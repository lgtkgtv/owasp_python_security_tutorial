"""
Path Traversal - SECURE version.

Same endpoint, but the resolved absolute path is verified to still be
inside BASE_DIR before the file is opened. Try the identical requests:

    curl "http://localhost:8000/files/hello.txt"
    curl "http://localhost:8000/files/../secret.txt"

The second request is now rejected - resolving "../secret.txt" against
BASE_DIR produces a path outside BASE_DIR, which the containment check
catches before any file is opened.
"""
import os
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI(title="Path Traversal - SECURE")
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "safe_files")


@app.get("/")
def root():
    return {"lab": "path-traversal", "variant": "secure", "try": "/files/../secret.txt"}


@app.get("/files/{filename:path}", response_class=PlainTextResponse)
def get_file(filename: str):
    # SAFE: resolve the real, absolute path and verify it's still inside
    # BASE_DIR before ever touching the filesystem.
    candidate = os.path.realpath(os.path.join(BASE_DIR, filename))
    base = os.path.realpath(BASE_DIR)
    if not (candidate == base or candidate.startswith(base + os.sep)):
        return "403: path escapes the allowed directory - request rejected"
    if not os.path.isfile(candidate):
        return f"404: {filename} not found"
    with open(candidate) as f:
        return f.read()
