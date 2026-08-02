"""
Vulnerable & Outdated Components - SECURE version.

Identical /scan endpoint, but requirements.txt pins pyyaml==6.0.1, which is
at or above the fixed version for the CVEs tracked in KNOWN_VULNERABLE.

    curl http://localhost:8000/scan
"""
from fastapi import FastAPI
from packaging import version as pkg_version

app = FastAPI(title="Vulnerable Components - SECURE")

KNOWN_VULNERABLE = {
    "pyyaml": {"max_vulnerable": "5.4", "cve": "CVE-2020-1747 / CVE-2020-14343"},
}


@app.get("/")
def root():
    return {"lab": "vulnerable-components", "variant": "secure"}


@app.get("/scan")
def scan():
    import yaml
    installed = yaml.__version__
    info = KNOWN_VULNERABLE["pyyaml"]
    is_vulnerable = pkg_version.parse(installed) < pkg_version.parse(info["max_vulnerable"])
    return {
        "package": "pyyaml",
        "installed_version": installed,
        "known_vulnerable_below": info["max_vulnerable"],
        "cve": info["cve"],
        "flagged": is_vulnerable,
    }
