#!/usr/bin/env python3
"""Generates examples/docker-compose.yml, which can launch every lab pair
at once. Run after scaffold.py.

Module list (id, track, ports) is read from examples/modules.json -- the
single source of truth also used by src/components/DockerLabsPortal.jsx and
examples/lab-portal.html, so adding a module here means editing one file
instead of three.
"""
import json
import os

EXAMPLES = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(EXAMPLES, "modules.json")) as f:
    MODULES = json.load(f)

lines = [
    "# Launches EVERY lab pair at once (48 containers). Prefer running one",
    "# module's own examples/{web,llm}/<module>/docker-compose.yml if you only",
    "# want to try a single lesson - it's faster and easier to reason about.",
    "#",
    "#   docker compose up --build          # everything",
    "#   docker compose up --build sqlinjection-vulnerable sqlinjection-secure",
    "#                                       # just one pair, from this root file",
    "services:",
]
for m in MODULES:
    name, track, vuln_port, secure_port = m["id"], m["track"], m["vuln"], m["secure"]
    lines.append(f"  {name}-vulnerable:")
    lines.append(f"    build: ./{track}/{name}/vulnerable")
    lines.append(f"    ports:")
    lines.append(f'      - "{vuln_port}:8000"')
    lines.append(f"  {name}-secure:")
    lines.append(f"    build: ./{track}/{name}/secure")
    lines.append(f"    ports:")
    lines.append(f'      - "{secure_port}:8000"')

with open(os.path.join(EXAMPLES, "docker-compose.yml"), "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"Wrote root docker-compose.yml with {len(MODULES)*2} services.")
