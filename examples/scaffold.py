#!/usr/bin/env python3
"""Scaffolds Dockerfile / requirements.txt / docker-compose.yml for every
module lab pair. app.py content is written separately per module (real,
hand-written vulnerability/fix logic) - this script only creates the
boilerplate that's identical across all of them.
"""
import os

EXAMPLES = os.path.dirname(os.path.abspath(__file__))

MODULES = [
    # (dir_name under web/ or llm/, track, vuln_port, secure_port, extra_pip_deps)
    ("sqlinjection", "web", 8001, 8002, []),
    ("xss", "web", 8003, 8004, []),
    ("brokenauth", "web", 8005, 8006, []),
    ("csrf", "web", 8007, 8008, []),
    ("pathtraversal", "web", 8009, 8010, []),
    ("commandinjection", "web", 8011, 8012, []),
    ("deserialization", "web", 8013, 8014, []),
    ("xxe", "web", 8015, 8016, ["defusedxml==0.7.1"]),
    ("ssrf", "web", 8017, 8018, ["httpx==0.27.0"]),
    ("secmisconfig", "web", 8019, 8020, []),
    ("sensitivedata", "web", 8021, 8022, ["passlib[bcrypt]==1.7.4"]),
    ("brokenaccess", "web", 8023, 8024, []),
    ("vulncomponents", "web", 8025, 8026, ["packaging==24.1"]),
    ("loggingfailures", "web", 8027, 8028, []),
    ("promptinjection", "llm", 8029, 8030, []),
    ("llmsensitiveinfo", "llm", 8031, 8032, []),
    ("llmsupplychain", "llm", 8033, 8034, ["packaging==24.1"]),
    ("datapoisoning", "llm", 8035, 8036, []),
    ("outputhandling", "llm", 8037, 8038, []),
    ("excessiveagency", "llm", 8039, 8040, []),
    ("systempromptleakage", "llm", 8041, 8042, []),
    ("vectorembedding", "llm", 8043, 8044, []),
    ("misinformation", "llm", 8045, 8046, []),
    ("unboundedconsumption", "llm", 8047, 8048, []),
]

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

for name, track, vuln_port, secure_port, extra_deps in MODULES:
    base = os.path.join(EXAMPLES, track, name)
    for variant in ("vulnerable", "secure"):
        d = os.path.join(base, variant)
        os.makedirs(d, exist_ok=True)
        # requirements.txt: base + any module-specific deps + a relative
        # copy of the shared mock_llm.py for llm-track modules.
        reqs = ["fastapi==0.111.0", "uvicorn[standard]==0.30.1"] + extra_deps
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
