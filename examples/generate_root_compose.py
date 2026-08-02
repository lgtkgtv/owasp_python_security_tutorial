#!/usr/bin/env python3
"""Generates examples/docker-compose.yml, which can launch every lab pair
at once. Run after scaffold.py. Reuses the same MODULES list."""
import os

EXAMPLES = os.path.dirname(os.path.abspath(__file__))

MODULES = [
    ("sqlinjection", "web", 8001, 8002),
    ("xss", "web", 8003, 8004),
    ("brokenauth", "web", 8005, 8006),
    ("csrf", "web", 8007, 8008),
    ("pathtraversal", "web", 8009, 8010),
    ("commandinjection", "web", 8011, 8012),
    ("deserialization", "web", 8013, 8014),
    ("xxe", "web", 8015, 8016),
    ("ssrf", "web", 8017, 8018),
    ("secmisconfig", "web", 8019, 8020),
    ("sensitivedata", "web", 8021, 8022),
    ("brokenaccess", "web", 8023, 8024),
    ("vulncomponents", "web", 8025, 8026),
    ("loggingfailures", "web", 8027, 8028),
    ("promptinjection", "llm", 8029, 8030),
    ("llmsensitiveinfo", "llm", 8031, 8032),
    ("llmsupplychain", "llm", 8033, 8034),
    ("datapoisoning", "llm", 8035, 8036),
    ("outputhandling", "llm", 8037, 8038),
    ("excessiveagency", "llm", 8039, 8040),
    ("systempromptleakage", "llm", 8041, 8042),
    ("vectorembedding", "llm", 8043, 8044),
    ("misinformation", "llm", 8045, 8046),
    ("unboundedconsumption", "llm", 8047, 8048),
]

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
for name, track, vuln_port, secure_port in MODULES:
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
