"""
Vulnerable & Outdated Components - VULNERABLE version.

This app's requirements.txt intentionally pins pyyaml==5.3.1, a version
affected by CVE-2020-1747 / CVE-2020-14343 (unsafe loading behavior later
fixed upstream). /scan reports what's actually installed against a small,
local known-CVE sample (the same data the tutorial's "Dependency Version
Checker" lab teaches with) and flags it - the point isn't that this exact
old yaml call is exploited here, it's that shipping a known-vulnerable,
pinned dependency is itself the vulnerability, waiting for the next CVE in
that library to become exploitable through whatever code path uses it.

    curl http://localhost:8000/scan
"""
from fastapi import FastAPI
from packaging import version as pkg_version

app = FastAPI(title="Vulnerable Components - VULNERABLE")

KNOWN_VULNERABLE = {
    "pyyaml": {"max_vulnerable": "5.4", "cve": "CVE-2020-1747 / CVE-2020-14343"},
    "requests": {"max_vulnerable": "2.20.0", "cve": "CVE-2018-18074"},
    "django": {"max_vulnerable": "3.2.18", "cve": "CVE-2023-24580 (and others)"},
    "pillow": {"max_vulnerable": "9.0.0", "cve": "CVE-2022-22817 (and others)"},
}


@app.get("/")
def root():
    return {"lab": "vulnerable-components", "variant": "vulnerable"}


@app.get("/scan")
def scan():
    import yaml  # PyYAML - version pinned in requirements.txt
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
