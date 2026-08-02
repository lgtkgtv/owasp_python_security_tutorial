# Vulnerable & Outdated Components - Runnable Lab

Unlike the other labs, the vulnerability here isn't in `app.py` - it's in
`requirements.txt`. The vulnerable app pins `pyyaml==5.3.1` (a version with
known CVEs); the secure app pins `pyyaml==6.0.1` (patched).

```bash
cd examples/web/vulncomponents && docker compose up --build
# vulnerable: http://localhost:8025   secure: http://localhost:8026
```

```bash
curl http://localhost:8025/scan   # {"installed_version":"5.3.1", "flagged": true, ...}
curl http://localhost:8026/scan   # {"installed_version":"6.0.1", "flagged": false, ...}
```

In a real pipeline, this is exactly what `pip-audit` or `safety` automate
in CI - scanning installed/pinned versions against a live CVE database
instead of this lab's small hardcoded sample.
