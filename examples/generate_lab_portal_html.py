#!/usr/bin/env python3
"""Regenerates the embedded MODULES array inside examples/lab-portal.html
from examples/modules.json -- the same single source of truth used by
src/components/DockerLabsPortal.jsx and generate_root_compose.py.

lab-portal.html stays a fully standalone, dependency-free static file (opened
directly via file:// or a trivial local server, no build step, no fetch/CORS
concerns) -- this script just means its module list is generated, not
hand-typed, so it can never drift from the other two consumers.

Run this after editing examples/modules.json, then re-verify (see
examples/README.md's "Adding a new lab pair" section).
"""
import json
import os
import re

EXAMPLES = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(EXAMPLES, "modules.json")) as f:
    MODULES = json.load(f)


def js_string(s):
    """JSON string escaping is a strict superset of what's needed for a
    JS double-quoted string literal here, EXCEPT we must also escape a
    literal '</script>' substring (e.g. inside XSS/output-handling hints),
    which would otherwise prematurely close the real <script> tag."""
    escaped = json.dumps(s)
    return escaped.replace("</script>", '<\\/script>')


def format_entry(m):
    return (
        f'  {{ id: "{m["id"]}", title: {js_string(m["title"])}, '
        f'owasp: "{m["owasp"]}", cwe: "{m["cwe"]}", track: "{m["track"]}",\n'
        f'    desc: {js_string(m["desc"])},\n'
        f'    vuln: {m["vuln"]}, secure: {m["secure"]}, hint: {js_string(m["hint"])} }}'
    )


entries = ",\n".join(format_entry(m) for m in MODULES)
new_block = f"const MODULES = [\n{entries}\n];"

path = os.path.join(EXAMPLES, "lab-portal.html")
with open(path) as f:
    html = f.read()

pattern = re.compile(r"const MODULES = \[[\s\S]*?\n\];")
new_html, count = pattern.subn(new_block, html, count=1)
assert count == 1, "expected exactly one MODULES array in lab-portal.html"

with open(path, "w") as f:
    f.write(new_html)

print(f"Regenerated lab-portal.html's MODULES array from modules.json ({len(MODULES)} entries).")
