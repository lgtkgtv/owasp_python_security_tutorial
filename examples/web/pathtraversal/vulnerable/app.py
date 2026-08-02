"""
Path Traversal - VULNERABLE version.

/files/{filename} is meant to only ever serve files inside safe_files/, but
it builds the path by simple string concatenation with no validation. Try:

    curl "http://localhost:8000/files/hello.txt"
    curl "http://localhost:8000/files/../secret.txt"

The second request escapes safe_files/ entirely and reads secret.txt from
one directory up - the classic "../" directory-traversal escape.
"""
import os
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI(title="Path Traversal - VULNERABLE")
BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "safe_files")


@app.get("/")
def root():
    return {"lab": "path-traversal", "variant": "vulnerable", "try": "/files/../secret.txt"}


@app.get("/files/{filename:path}", response_class=PlainTextResponse)
def get_file(filename: str):
    # DANGEROUS: no check that the resolved path stays inside BASE_DIR.
    path = os.path.join(BASE_DIR, filename)
    if not os.path.isfile(path):
        return f"404: {filename} not found"
    with open(path) as f:
        return f.read()
