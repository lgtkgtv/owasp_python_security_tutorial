# Runnable Labs

Every module in the interactive tutorial has a companion pair of real, runnable
FastAPI apps here - one **vulnerable** and one **secure** - so you can attack
and defend an actual server instead of only reading about it. The 14 web-track
labs are genuine Python vulnerabilities/fixes; the 10 LLM-track labs run
against a small, deterministic **mock LLM** (see `shared/mock_llm.py`) instead
of a real model, so there's no API key or cost required to try them.

## ⚠️ Safety notes

- **These are deliberately vulnerable apps.** Only run them on your own
  machine, on localhost. Never deploy the `vulnerable/` variants anywhere
  reachable from the internet or a shared network.
- Each app is a small, self-contained teaching example, not a production
  pattern - copy the *idea* from the `secure/` variant, not the literal code,
  into anything real.
- The deserialization lab's exploit payload is intentionally harmless (it just
  prints a line) - it demonstrates the mechanism, not a destructive attack.

## Prerequisites

- **Git** - to clone the repo.
- **Docker Engine + the Docker Compose plugin** - Docker Desktop (macOS/Windows/Linux)
  or native Docker on Linux/WSL2 both work. Verify with:
  ```bash
  docker --version
  docker compose version
  ```
- **Free ports 8001-8048** on your machine (or run just the one module you
  need, which only uses 2 of those ports).

## Clone the repo

```bash
git clone https://github.com/lgtkgtv/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial
```

## Prefer clicking over copy-pasting ports?

The deployed tutorial site has an in-app **"🐳 Runnable Docker Labs"** page
(linked from the home page) that lists all 24 pairs with clickable
`localhost` links and a search/filter UI - once the containers below are
running, that page is the easiest way to jump between them. It's the same
information as this file, just easier to browse.

## Run one lab

```bash
cd examples/web/sqlinjection      # or any other module folder
docker compose up --build
```

Every module folder has its own `README.md` with the exact `curl` commands to
try, and its own `docker-compose.yml` so you only spin up that one pair.

## Run everything at once

```bash
cd examples
docker compose up --build -d
# 48 containers, ports 8001-8048 (see the table below)
```

## Cleanup

Stop and remove containers when you're done with a session:

```bash
# from the same directory you ran "docker compose up" in
docker compose down
```

Also remove the built images, to fully reclaim disk space:

```bash
docker compose down --rmi all
```

Just pausing for later (keep the images, stop the containers)?

```bash
docker compose stop     # pause
docker compose start    # resume later, no rebuild needed
```

> If you ran both the root `examples/docker-compose.yml` *and* an individual
> module's `docker-compose.yml` (e.g. `examples/web/sqlinjection/`), these are
> two separate Compose "projects" that can each try to bind the same host
> port. Run `docker compose down` in the one you started first before
> `docker compose up` in the other, to avoid a `port is already allocated`
> error.

## Port map

| Module (web track)                     | Vulnerable | Secure |
|-----------------------------------------|:----------:|:------:|
| SQL Injection                            | 8001       | 8002   |
| Cross-Site Scripting (XSS)               | 8003       | 8004   |
| Broken Authentication                    | 8005       | 8006   |
| CSRF                                     | 8007       | 8008   |
| Path Traversal                           | 8009       | 8010   |
| Command Injection                        | 8011       | 8012   |
| Insecure Deserialization                 | 8013       | 8014   |
| XML External Entities (XXE)              | 8015       | 8016   |
| SSRF                                     | 8017       | 8018   |
| Security Misconfiguration                | 8019       | 8020   |
| Sensitive Data Exposure                  | 8021       | 8022   |
| Broken Access Control (IDOR)             | 8023       | 8024   |
| Vulnerable & Outdated Components          | 8025       | 8026   |
| Security Logging & Monitoring Failures   | 8027       | 8028   |

| Module (LLM track, mock LLM)             | Vulnerable | Secure |
|-------------------------------------------|:----------:|:------:|
| Prompt Injection                          | 8029       | 8030   |
| Sensitive Information Disclosure          | 8031       | 8032   |
| Supply Chain                              | 8033       | 8034   |
| Data and Model Poisoning                  | 8035       | 8036   |
| Improper Output Handling                  | 8037       | 8038   |
| Excessive Agency                          | 8039       | 8040   |
| System Prompt Leakage                     | 8041       | 8042   |
| Vector and Embedding Weaknesses           | 8043       | 8044   |
| Misinformation                            | 8045       | 8046   |
| Unbounded Consumption                     | 8047       | 8048   |

## Layout

```
examples/
├── README.md                 # this file
├── docker-compose.yml        # launches every pair at once
├── shared/
│   └── mock_llm.py           # deterministic stand-in "LLM" used by the llm/ labs
├── web/
│   └── <module>/
│       ├── docker-compose.yml
│       ├── README.md          # what it demonstrates + curl walkthrough
│       ├── vulnerable/
│       │   ├── app.py
│       │   ├── Dockerfile
│       │   └── requirements.txt
│       └── secure/
│           ├── app.py
│           ├── Dockerfile
│           └── requirements.txt
└── llm/
    └── <module>/              # same layout as web/, plus a copy of mock_llm.py
```

## Adding a new lab pair

The 24-module list (id, title, OWASP/CWE tags, track, ports, description,
example curl "hint") lives in exactly one place: `examples/modules.json`.
Three things read it, so a new module means one JSON entry instead of three
hand-edits:

1. Add an entry to `examples/modules.json`.
2. Run `python3 examples/scaffold.py` - creates the folder structure,
   `Dockerfile`, `requirements.txt` (base deps; add any module-specific ones
   to `EXTRA_DEPS` in `scaffold.py` first if needed), and per-module
   `docker-compose.yml`.
3. Run `python3 examples/generate_root_compose.py` - regenerates the root
   `docker-compose.yml` covering all pairs.
4. Run `python3 examples/generate_lab_portal_html.py` - regenerates
   `lab-portal.html`'s embedded module list to match.
5. Write the real vulnerable/secure `app.py` logic by hand (deliberately not
   templated), then add/update `src/components/DockerLabsPortal.jsx`'s tests
   if you added a whole new module (the component itself needs no changes -
   it imports `modules.json` directly).

**Careful:** `scaffold.py` overwrites every module's `requirements.txt` /
`Dockerfile` / `docker-compose.yml` unconditionally, every time it runs - it's
not additive. If dependency versions ever get bumped by hand in the real
`requirements.txt` files (as happened during a Dependabot triage pass), bump
`BASE_DEPS` / `EXTRA_DEPS` in `scaffold.py` to match, or a future re-run will
silently revert them. A few Dockerfiles also have small hand-added lines
beyond the generated template (`pathtraversal` and `xxe` copy in extra
fixture files, `vulncomponents/vulnerable` installs a compiler) - re-running
`scaffold.py` will *not* preserve those; re-add them after regenerating.

## How each pair was verified

Every `app.py` in this directory was actually run (via `uvicorn`, outside
Docker) and exercised with real HTTP requests before being committed -
confirming the vulnerable variant genuinely misbehaves (SQL injection returns
extra rows, XSS payloads render unescaped, the CSRF transfer succeeds on a
forged request, the mock LLM leaks its system prompt, etc.) and the secure
variant genuinely blocks or mitigates the same attack. All 48 Docker images
have since been build-verified directly (including `vulncomponents-vulnerable`,
the one requiring a compiler to build its intentionally old PyYAML pin), and
**`.github/workflows/docker-labs-ci.yml` now builds all 48 images
automatically on every push/PR touching `examples/**`**, so a broken
Dockerfile or bad pin surfaces in CI instead of at merge time. That CI job
only proves each image *builds* - it doesn't start containers or curl them,
so the behavioral verification above is still done by hand during
development.

**Dependency hygiene pass:** `fastapi`, `uvicorn`, `python-multipart`, `httpx`,
`lxml`, and the `secure`-variant `pyyaml`/`packaging` pins across all 48 apps
were bumped to current stable releases and re-verified with real HTTP
requests (Form parsing, XXE leak/block, SSRF fetch, SCA `/scan` reporting)
after the bump. The **one exception, left untouched on purpose**, is
`examples/web/vulncomponents/vulnerable/requirements.txt`'s `pyyaml==5.3.1` -
that outdated pin *is* the lesson for "Vulnerable & Outdated Components"
(OWASP A06:2021), so bumping it would delete the module's teaching point.
`.github/dependabot.yml` excludes that one directory from automated
version-update PRs for the same reason; the corresponding Dependabot
*security alert* for it still needs a one-time manual dismissal (Security ->
Dependabot alerts -> "Won't fix", with a note pointing here) since alert
suppression isn't configurable from `dependabot.yml`.

## Feedback & feature requests

Found a bug in a lab, or have an idea for a new module? Reach out to
Sachin Godse - lgtkgtv+sachin-godse@gmail.com.
