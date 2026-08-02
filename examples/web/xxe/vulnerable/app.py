"""
XML External Entities (XXE) - VULNERABLE version.

/parse accepts raw XML and parses it with lxml configured to explicitly
resolve external entities (resolve_entities=True) - the historically common
(and historically default) lxml configuration that made real-world XXE
vulnerabilities possible for years. Try a normal document first, then one
that declares an external entity pointing at a local file:

    curl -X POST http://localhost:8000/parse --data-binary '<root><name>Alice</name></root>'

    curl -X POST http://localhost:8000/parse --data-binary '<?xml version="1.0"?>
<!DOCTYPE root [ <!ENTITY xxe SYSTEM "file:///app/secret.txt"> ]>
<root><name>&xxe;</name></root>'

The second response's "name" field contains the *contents of secret.txt* -
the parser fetched and inlined a local file just because the document told
it to. The same mechanism can reach internal network services (SSRF-style)
via http:// URLs in the entity declaration.
"""
from lxml import etree
from fastapi import FastAPI, Request

app = FastAPI(title="XXE - VULNERABLE")

# DANGEROUS: resolve_entities=True tells lxml to fetch and inline whatever
# a DOCTYPE's external entity points at - a local file, or an internal URL.
UNSAFE_PARSER = etree.XMLParser(resolve_entities=True, no_network=False)


@app.get("/")
def root():
    return {"lab": "xxe", "variant": "vulnerable"}


@app.post("/parse")
async def parse(request: Request):
    body = await request.body()
    tree = etree.fromstring(body, parser=UNSAFE_PARSER)
    name = tree.findtext("name")
    return {"name": name}
