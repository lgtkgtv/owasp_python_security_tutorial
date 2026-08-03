#!/usr/bin/env python3
"""Scaffolds Dockerfile / requirements.txt / docker-compose.yml for every
module lab pair. app.py content is written separately per module (real,
hand-written vulnerability/fix logic) - this script only creates the
boilerplate that's identical across all of them.

Module id/track/ports are read from examples/modules.json (the same file
DockerLabsPortal.jsx and generate_root_compose.py use), so adding a module
means adding one entry there instead of three.

Per-module extra pip dependencies stay here, not in modules.json: they're a
build concern for this scaffolding tool, not portal display metadata, and
one module (vulncomponents) needs a different pin per variant, which the
portal's schema has no reason to model.

WARNING: running this script overwrites every module's requirements.txt /
Dockerfile / docker-compose.yml unconditionally. If dependency versions get
bumped in the real requirements.txt files (as happened during the Dependabot
triage pass), bump BASE_DEPS / EXTRA_DEPS below too, or a future re-run of
this script will silently revert them.
"""
import json
import os

EXAMPLES = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(EXAMPLES, "modules.json")) as f:
    _MODULES_JSON = json.load(f)

# (dir_name under web/ or llm/, track, vuln_port, secure_port)
MODULES = [(m["id"], m["track"], m["vuln"], m["secure"]) for m in _MODULES_JSON]

# Base deps every app gets, both variants.
BASE_DEPS = ["fastapi==0.141.1", "uvicorn[standard]==0.52.1"]

# Extra deps per module id, applied to both variants unless the module id
# maps to a dict with explicit "vulnerable"/"secure" keys instead of a list
# (only vulncomponents needs this: the outdated pyyaml pin IS the lesson for
# the vulnerable variant, so it must never match the secure variant's pin).
EXTRA_DEPS = {
    "xxe": ["lxml==6.1.1"],
    "ssrf": ["httpx==0.28.1"],
    "sensitivedata": ["passlib[bcrypt]==1.7.4", "python-multipart==0.0.32"],
    "brokenauth": ["python-multipart==0.0.32"],
    "csrf": ["python-multipart==0.0.32"],
    "loggingfailures": ["python-multipart==0.0.32"],
    "vulncomponents": {
        "vulnerable": ["packaging==26.2", "pyyaml==5.3.1"],
        "secure": ["packaging==26.2", "pyyaml==6.0.3"],
    },
    "llmsupplychain": ["packaging==26.2"],
}


def extra_deps_for(module_id, variant):
    entry = EXTRA_DEPS.get(module_id, [])
    if isinstance(entry, dict):
        return entry.get(variant, [])
    return entry


DOCKERFILE = """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
{extra_copy}EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
"""

COMPOSE = """# Run just this module's pair:
#   cd examples/{track}/{name} && docker compose up --build
#
# Vulnerable: http://localhost:{vuln_port}   Secure: http://localhost:{secure_port}
services:
  vulnerable:
    build: ./vulnerable
    ports:
      - "{vuln_port}:8000"
  secure:
    build: ./secure
    ports:
      - "{secure_port}:8000"
"""

for name, track, vuln_port, secure_port in MODULES:
    base = os.path.join(EXAMPLES, track, name)
    for variant in ("vulnerable", "secure"):
        d = os.path.join(base, variant)
        os.makedirs(d, exist_ok=True)
        # requirements.txt: base + any module/variant-specific deps + a
        # relative copy of the shared mock_llm.py for llm-track modules.
        reqs = BASE_DEPS + extra_deps_for(name, variant)
        with open(os.path.join(d, "requirements.txt"), "w") as f:
            f.write("\n".join(reqs) + "\n")
        extra_copy = ""
        if track == "llm":
            extra_copy = "COPY mock_llm.py .\n"
        with open(os.path.join(d, "Dockerfile"), "w") as f:
            f.write(DOCKERFILE.format(extra_copy=extra_copy))
        if track == "llm":
            # copy the shared mock LLM into each variant dir so the Docker
            # build context is self-contained (no parent-dir COPY needed)
            with open(os.path.join(EXAMPLES, "shared", "mock_llm.py")) as f:
                mock_src = f.read()
            with open(os.path.join(d, "mock_llm.py"), "w") as f:
                f.write(mock_src)
    with open(os.path.join(base, "docker-compose.yml"), "w") as f:
        f.write(COMPOSE.format(track=track, name=name, vuln_port=vuln_port, secure_port=secure_port))

print(f"Scaffolded {len(MODULES)} module pairs ({len(MODULES)*2} apps).")
