"""
XXE - SECURE version.

Same /parse endpoint, but the lxml parser is explicitly configured with
resolve_entities=False and no_network=True (also lxml's modern default,
made explicit here so the fix is visible rather than implicit). Try the
identical malicious document:

    curl -X POST http://localhost:8000/parse --data-binary '<?xml version="1.0"?>
<!DOCTYPE root [ <!ENTITY xxe SYSTEM "file:///app/secret.txt"> ]>
<root><name>&xxe;</name></root>'

This now returns an error instead of leaking the file - the parser refuses
to resolve the external entity at all, so &xxe; never gets replaced with
the file's contents.
"""
from lxml import etree
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="XXE - SECURE")

# SAFE: never resolve external entities, never make network requests while
# parsing untrusted XML.
SAFE_PARSER = etree.XMLParser(resolve_entities=False, no_network=True)


@app.get("/")
def root():
    return {"lab": "xxe", "variant": "secure"}


@app.post("/parse")
async def parse(request: Request):
    body = await request.body()
    try:
        tree = etree.fromstring(body, parser=SAFE_PARSER)
    except Exception as e:
        return JSONResponse({"error": f"rejected unsafe XML: {type(e).__name__}"}, status_code=400)
    name = tree.findtext("name")
    if name is None:
        return {"name": None, "note": "external entity was not resolved"}
    return {"name": name}
