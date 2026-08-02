# OWASP Python & AI/ML Security Tutorial

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/contributing-guide.md)

> Interactive, hands-on security tutorial covering classic OWASP Top 10 / CWE Top 25 vulnerabilities (Python/FastAPI) **and** the OWASP Top 10 for LLM Applications (2025) - for developers building both traditional web backends and AI/ML-powered apps.

[Live Demo](https://lgtkgtv.github.io/owasp_python_security_tutorial/) | [Report Bug](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues) | [Request Module](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues)

## 🎯 Overview

This is a comprehensive, **interactive security education platform** designed to teach developers about application security through hands-on learning - spanning two tracks. The **Python & Web Application Security** track covers the OWASP Top 10 and CWE Top 25. The **AI/LLM Application Security** track covers the OWASP Top 10 for LLM Applications (2025), for anyone building on top of large language models.


### Why This Tutorial?

- ✅ **Learn by Doing** - Interactive labs where you can safely exploit and fix vulnerabilities
- ✅ **Production-Ready Code** - All examples use FastAPI with real security best practices
- ✅ **Comprehensive Coverage** - Vulnerable code → Explanation → Fix → Quiz reinforcement
- ✅ **Visual Learning** - Syntax-highlighted code with before/after comparisons
- ✅ **Progress Tracking** - Save your progress as you complete modules
- ✅ **Community-Driven** - Open source and accepting contributions

## 📚 Current Modules

### 🐍 Track 1: Python & Web Application Security

| Module                             | OWASP           | CWE      | Severity | Status      |
|-------------------------------------|-----------------|----------|----------|-------------|
| SQL Injection                        | #3              | CWE-89   | Critical | ✅ Complete |
| Cross-Site Scripting (XSS)           | #3              | CWE-79   | High     | ✅ Complete |
| Broken Authentication                | #7              | CWE-287  | Critical | ✅ Complete |
| Broken Access Control (IDOR)         | #1              | CWE-639  | Critical | ✅ Complete |
| Cross-Site Request Forgery (CSRF)    | A01:2021        | CWE-352  | High     | ✅ Complete |
| Path Traversal                       | A01:2021        | CWE-22   | High     | ✅ Complete |
| Command Injection                    | A03:2021        | CWE-78   | Critical | ✅ Complete |
| Insecure Deserialization             | A08:2021        | CWE-502  | Critical | ✅ Complete |
| XML External Entities (XXE)          | A05:2021        | CWE-611  | High     | ✅ Complete |
| Server-Side Request Forgery (SSRF)   | A10:2021        | CWE-918  | High     | ✅ Complete |
| Security Misconfiguration            | A05:2021        | Multiple | Medium   | ✅ Complete |
| Sensitive Data Exposure              | A02:2021        | CWE-311  | High     | ✅ Complete |
| Vulnerable & Outdated Components     | A06:2021        | CWE-1104 | High     | ✅ Complete |
| Security Logging & Monitoring Failures | A09:2021      | CWE-778  | Medium   | ✅ Complete |

### 🤖 Track 2: AI / LLM Application Security

Based on the [OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/).
Code examples use FastAPI + the OpenAI Python SDK as a realistic, representative stack.

| Module                             | Reference       | Severity | Status      |
|-------------------------------------|-----------------|----------|-------------|
| Prompt Injection                     | LLM01:2025      | Critical | ✅ Complete |
| Sensitive Information Disclosure      | LLM02:2025      | High     | ✅ Complete |
| Supply Chain                          | LLM03:2025      | High     | ✅ Complete |
| Data and Model Poisoning              | LLM04:2025      | High     | ✅ Complete |
| Improper Output Handling              | LLM05:2025      | Critical | ✅ Complete |
| Excessive Agency                      | LLM06:2025      | Critical | ✅ Complete |
| System Prompt Leakage                 | LLM07:2025      | Medium   | ✅ Complete |
| Vector and Embedding Weaknesses       | LLM08:2025      | Medium   | ✅ Complete |
| Misinformation                        | LLM09:2025      | Medium   | ✅ Complete |
| Unbounded Consumption                 | LLM10:2025      | High     | ✅ Complete |

All 24 modules (14 web + 10 AI/LLM) follow the same Learn → Interactive Lab → Quiz structure. Note: unlike the web
track, several LLM risks (Prompt Injection especially) don't have a complete structural fix today - those modules are
explicit about mitigating risk vs. claiming a solved problem.

[Suggest a new module →](https://github.com/lgtkgtv/owasp_python_security_tutorial/discussions)

## 🧪 Setup, Run, Test & Demo

### For Learners

Just visit the [live tutorial](https://lgtkgtv.github.io/owasp_python_security_tutorial/) - no installation needed.

### For Contributors

**Prerequisites:** Node.js 18+, git, and pnpm (`npm install -g pnpm` if you don't have it).

**1. Setup**
```bash
git clone https://github.com/lgtkgtv/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial
pnpm install
```

**2. Run (development)**
```bash
pnpm dev
# open http://localhost:5173 - hot-reloads on every save
```

**3. Run (production build - what GitHub Pages actually serves)**
```bash
pnpm build      # outputs to dist/
pnpm preview    # serves the built dist/ at http://localhost:4173
```
Always check `pnpm preview` before pushing, not just `pnpm dev` - it's the only local way to catch a bug that only
shows up in the production build.

**4. Test**

```bash
pnpm test         # runs the full Vitest suite once (CI mode)
pnpm test:watch   # re-runs affected tests on save, for local development
```

There's an automated suite (Vitest + React Testing Library, jsdom environment) covering:

- **Every one of the 24 modules** (`src/modules/modules.smoke.test.jsx`): renders, shows its own title, and cycles
  through Learn -> Interactive Lab -> Quiz without throwing or logging a React warning/error. This is the regression
  net for future edits - it's the kind of test that would have caught a missing icon import or a broken tab before
  it ever reached the browser.
- **Lab detection logic** for the modules with real attack-detection code (SQL Injection, XSS, Broken Authentication,
  Broken Access Control, Vulnerable Components, Logging Failures) - both the "this is an attack" and "this is safe"
  paths, not just the happy path.
- **Shared components** (`PythonCode`, `Quiz` - including the perfect-score/partial-score/onComplete branches).
- **`moduleConfigs`** sanity checks (24 entries, correct 14/10 web/llm split, every entry has the required fields).
- **The main app shell** (`OWASPTutorial.jsx`): home page renders both tracks, clicking a card opens the (lazily
  loaded) module, `localStorage` progress persistence round-trips correctly.

`pnpm build` remains a second, independent check - it catches anything Vitest's jsdom environment wouldn't (bundling
errors, unresolved imports). Until end-to-end coverage exists, still run this manual pass before shipping a new
module, since it exercises the actual rendered UI a learner sees:

- [ ] Every module card on the home page opens
- [ ] Interactive Lab: try each attack input listed in that module's own "Attack Examples" table and confirm the
      labeled vulnerable/blocked outcome appears
- [ ] Refresh the page - completion badges and the "Modules Completed" stat should still reflect progress
- [ ] Resize to a narrow/mobile width and re-check the module grid and tab layout

**5. Demonstrate (a 5-10 minute walkthrough)**

A good order for showing this project to someone else:
1. Start on the module grid - point out the two tracks (Python & Web, and AI/LLM), plus the per-module progress bar
   and the "Your Progress" summary (both backed by `localStorage`, no login required).
2. Open one classic module (e.g. **SQL Injection**) end-to-end: Learn tab → flip "Before/After" to "Side-by-Side" →
   Interactive Lab → run `admin' OR '1'='1'` from its own attack table and show the bypass result → Quiz → answer
   one wrong on purpose to show the inline explanation.
3. Open one AI/LLM module (e.g. **Prompt Injection**) the same way - it's a good contrast because the module is
   explicit that, unlike SQL injection, there's no complete structural fix available today, only risk reduction.
4. Briefly open dev tools → Application → Local Storage to show exactly what "progress tracking" persists (a JSON
   blob keyed `owasp-tutorial-progress`).
5. Mention the deploy pipeline: every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
   straight to GitHub Pages - no manual deploy step.

## 📖 Tutorial Structure

Each module follows a consistent, pedagogically-sound structure:

### 1. **Learn Tab** 
- Understanding the vulnerability with code examples
- Real-world impact and attack scenarios
- Best Known Methods (BKM) for fixing with before/after code comparison

### 2. **Interactive Lab**
- Safe environment to test actual attacks
- Multiple attack vectors to try
- Real-time feedback showing vulnerable vs secure behavior

### 3. **Quiz**
- Knowledge reinforcement questions
- Detailed explanations for each answer
- Progress tracking

## 🐳 Runnable Docker Labs

The browser-based "Interactive Lab" tab simulates each attack in JavaScript so
the whole tutorial can run as a static site with zero setup. For anyone who
wants to go one level deeper, `examples/` contains a **real, runnable
vulnerable/secure FastAPI pair for every one of the 24 modules** - actual
Python code you attack and fix with `curl`, launched via Docker Compose. The
10 LLM-track labs run against a small deterministic mock LLM (`examples/shared/mock_llm.py`),
so there's no API key or cost to try them.

```bash
cd examples/web/sqlinjection && docker compose up --build
curl "http://localhost:8001/users/admin%27%20OR%20%271%27%3D%271"   # vulnerable: leaks all users
curl "http://localhost:8002/users/admin%27%20OR%20%271%27%3D%271"   # secure: returns nothing
```

See `examples/README.md` for the full port map, safety notes, prerequisites,
and cleanup commands, and a `docker compose up` command to launch every lab
at once.

**In-app portal:** once the containers are running, the deployed tutorial
site itself has a "🐳 Runnable Docker Labs" page (linked from the home page)
listing all 24 pairs with clickable `localhost` links, OWASP/CWE badges, and
a search/filter UI - no need to cross-reference the port table by hand.

## 🏗️ Project Structure

```
owasp_python_security_tutorial/
├── index.html                  # HTML entry point (Vite root - not under public/)
├── src/
│   ├── OWASPTutorial.jsx       # Main app shell - home page, routing, progress state.
│   │                           # Every module is React.lazy()-loaded from modules/ below.
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── PythonCode.jsx      # Syntax-highlighted code block, shared by every module
│   │   └── Quiz.jsx            # Quiz question/answer/scoring UI, shared by every module
│   ├── config/
│   │   ├── moduleConfigs.js    # Module metadata (title, OWASP/CWE id, icon, track, ...)
│   │   └── colorClasses.js     # Tailwind class lookup per module accent color
│   ├── modules/
│   │   ├── web/                # 14 modules - classic OWASP Top 10 / CWE Top 25
│   │   └── llm/                # 10 modules - OWASP Top 10 for LLM Applications (2025)
│   └── test/
│       └── setup.js            # Vitest + jest-dom setup
├── examples/                   # Runnable Docker labs (see "Runnable Docker Labs" above)
│   ├── README.md                # Port map, safety notes, run-everything command
│   ├── docker-compose.yml       # Launches all 24 vulnerable/secure pairs at once
│   ├── shared/mock_llm.py       # Deterministic mock LLM used by the llm/ labs
│   ├── web/<module>/            # 14 web-track vulnerable+secure FastAPI pairs
│   └── llm/<module>/            # 10 LLM-track vulnerable+secure pairs (mock LLM)
├── docs/
│   ├── contributing-guide.md   # Contribution guidelines
│   ├── module-template.md      # Template for new modules
│   └── ...                     # Setup guides (some overlapping - see Critique)
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment (build + publish on push to main)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite + Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── license.md                  # MIT license
└── README.md                   # This file
```

Each module file under `modules/web/` or `modules/llm/` is self-contained (its own Learn/Interactive
Lab/Quiz content and lab logic) and is only downloaded by the browser when a learner actually opens it - the
production build code-splits all 24 modules into separate chunks instead of one monolithic bundle.

## 🧱 Tech Stack & Why It Was Chosen

This project optimizes for two things above all else: **zero install for learners** and **fast iteration for one
maintainer writing many similar modules**. Every choice below follows from that.

| Layer            | Choice                          | Why It Fits This Project                                                                                                                                     |
|-------------------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| UI framework      | React 18 (function components + hooks) | Every module has the same shape (Learn/Lab/Quiz tabs + progress state) - hooks make that repeated pattern trivial to copy and reason about                     |
| Build tool        | Vite                            | Near-instant hot reload while iterating on markup-heavy modules; produces a plain static `dist/` folder GitHub Pages can serve as-is                            |
| Styling           | Tailwind CSS (utility classes)  | Lets one person restyle and duplicate 24 near-identical module layouts without hand-maintaining a growing separate stylesheet                                  |
| Icons             | lucide-react                    | Tree-shakeable (only the icons a module imports ship in the bundle), one consistent stroke-style icon set                                                       |
| Hosting           | GitHub Pages + GitHub Actions    | Free static hosting, nothing to patch or pay for, deploys automatically on every push to `main` via `deploy.yml`                                                 |
| "Backend"         | None by default - simulated in the browser; real FastAPI backend available in `examples/` | The default in-browser lab keeps the whole tutorial static, zero-install, and unhackable (there's no live server to actually attack) - but is an approximation rather than a real target. `examples/` now offers an actual runnable vulnerable/secure FastAPI pair per module via Docker Compose for anyone who wants to attack a real server instead (see "Runnable Docker Labs" above) |
| Example language  | Python + FastAPI (+ OpenAI SDK for the AI/LLM track) | Modern, type-hinted, widely taught; `async def` signatures with type hints make vulnerable-vs-fixed diffs easy to scan, and the OpenAI SDK is the most broadly recognized pattern for the LLM modules |
| Persistence       | Browser `localStorage`          | Progress tracking needs no account system or database for a single-user, static-site tutorial                                                                   |
| Architecture      | Per-module files, `React.lazy()` code-splitting | Each of the 24 modules lives in its own file under `src/modules/{web,llm}/` and is only downloaded when a learner opens it - keeps the "copy an existing module" contribution model from `docs/module-template.md` while avoiding one-giant-file merge conflicts and a single monolithic bundle |

In short: every layer was picked to keep the project **free to run, free to host, and safe by construction**, while
staying simple enough for one person to keep extending it module by module.

## 🔍 Honest Critique

Candid, warts-and-all feedback on the project as it stands - so contributors (and the maintainer) have a clear list
of what to improve next, not just a features list.

**Content & coverage.** Strong overlap with both the OWASP Top 10 (2021) and the CWE Top 25 in the web track's 14 modules, spanning
injection (SQLi, Command Injection, XXE), authentication/session handling and authorization (Broken Authentication,
Broken Access Control/IDOR), client-side risks (XSS, CSRF), and infrastructure-adjacent issues (SSRF, Security
Misconfiguration, Sensitive Data Exposure, Insecure Deserialization, Path Traversal, Vulnerable and Outdated
Components, Security Logging & Monitoring Failures). *(Update: this previously flagged three gaps - no Broken
Access Control/IDOR module, no dependency/SCA-scanning module, no logging/monitoring failures module - all three
now have dedicated modules above.)* Remaining gaps against the full OWASP Top 10 (2021)/CWE Top 25 are narrower:
no dedicated module for injection variants like NoSQL/LDAP injection, and no coverage of cryptographic failures
beyond what's folded into Sensitive Data Exposure.

**Usefulness.** Genuinely useful as a first, intuitive pass at "why is this dangerous and what's the fix," especially
for developers who've never seen a real exploit. The in-browser lab's weakest link is *how* it detects an "attack":
most check input against a list of suspicious substrings/regex (`;`, `..`, `__reduce__`, etc.). That's a reasonable
simulation, but it risks teaching the wrong mental model - real defenses like parameterized queries or `shell=False`
don't work by *detecting* bad input, they work by making that whole *class* of input structurally impossible. A
learner who walks away thinking "security = pattern-matching bad strings" has learned the exact anti-pattern
(denylisting) that each module's own "How to Fix It" section correctly argues against. *(Update: `examples/` now
gives learners who want the real thing an actual FastAPI server where the fix is a real parameterized query, a real
`shell=False`, a real allowlist - not string matching - closing this gap for anyone who runs it. The in-browser lab
itself is unchanged and still simulates via pattern matching, which remains the right trade-off for a zero-install
default; a one-line callout pointing to `examples/` in each Lab tab would make the connection more discoverable.)*

**Ease of use.** For learners: excellent - zero install, one URL, works on a phone. For contributors: rougher. The
`docs/` folder currently mixes several overlapping, scaffolding-era setup guides (`setup-guide.md`,
`quick-start-commands.md`, `complete-automated-setup-script.sh`, a `final-setup-instructions - All in One Place.md`)
that reference a `public/` folder and file names that don't match what's actually in the repo. Worth consolidating
into one accurate contributor guide.

**Presentation.** Consistent, polished dark theme; progress bars and severity badges read well at a glance. The
hand-rolled `PythonCode` syntax highlighter is a nice touch but has a short keyword list (missing `lambda`, `yield`,
`global`, `assert`, `is`, and others) and doesn't handle multi-line triple-quoted strings past their first line -
swapping in an established highlighter (e.g. `react-syntax-highlighter` with Prism) would be more correct for less
code to maintain. The quiz also has no in-place "retry" button after submitting - the only way to try again is to
leave the module and re-enter it, which remounts the component and clears its state.

**Architecture & code quality.** *(Update: this was previously the single highest-leverage refactor available to
the project - it's now done.)* The former single ~10,500-line `src/OWASPTutorial.jsx` has been split into one file
per module under `src/modules/{web,llm}/`, plus shared `src/components/` (`PythonCode`, `Quiz`) and `src/config/`
(`moduleConfigs`, `colorClasses`). The main shell now `React.lazy()`-loads every module, so `vite build` emits one
~172 KB main bundle plus 24 small per-module chunks (roughly 5-33 KB each) instead of one ~597 KB monolith - a
learner only downloads the module they actually open. This also removes the single-file merge-conflict risk for
contributors adding new modules in parallel. An automated Vitest + React Testing Library suite (see Test section
above) now backs this structure, covering every module's render/tab-switch path plus the real attack-detection
logic in the modules that have it.

**Other missing topics.** Rate limiting / brute-force & API abuse as its own module (currently just a code snippet
inside Broken Authentication); security headers beyond CORS (CSP, HSTS, X-Frame-Options, `Permissions-Policy`); and
dedicated secrets management (env vars vs. vaults vs. secrets accidentally committed to git history) beyond the
brief mention inside Sensitive Data Exposure. *(Update: an automated Vitest test suite now exists - see the Test
section above - closing what was previously listed here as a gap.)*

**AI/ML security point of view.** *(Update: this critique originally flagged that the project had zero AI/ML-specific
coverage - that gap is what motivated adding the second track above, so this section now reflects the current state
rather than a remaining gap.)* The 10 new modules are grounded in the
[OWASP Top 10 for LLM Applications (2025)](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/),
and several were deliberately written to connect back to the classic track already here: Improper Output Handling is
framed explicitly as XSS/SQLi/command-injection-with-a-model-as-the-vector, and Sensitive Information Disclosure and
System Prompt Leakage reuse the same "never put secrets where they can be extracted" lesson as the classic Sensitive
Data Exposure module. Two honest caveats remain. First, the same lab-simulation limitation flagged under Usefulness
applies here too, arguably more so: the Prompt Injection module's own "How to Fix It" section is explicit that
keyword/guardrail filtering is risk reduction, not a solved problem the way parameterized queries solve SQL
injection - a nuance that's easy to lose if a learner skips the disclaimer and only plays with the lab. Second, the
OWASP GenAI Security Project's Top 10 list is still actively revised (this is the 2025/v2.0 edition), so unlike the
2021 web Top 10, this track will likely need a re-sync sooner than the classic one.

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New security modules
- 🎨 UI/UX enhancements
- 🌐 Translations

Please read our [Contributing Guide](docs/contributing-guide.md) and [Module Template](docs/module-template.md) to get started.

### Adding a New Module

1. Review the [Module Template](docs/module-template.md)
2. Create your module following the existing pattern
3. Add it to the module configuration
4. Test thoroughly
5. Submit a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [license.md](license.md) file for details.

## 🙏 Acknowledgments

- [OWASP Foundation](https://owasp.org/) for security guidelines
- [MITRE CWE](https://cwe.mitre.org/) for vulnerability classifications
- [FastAPI](https://fastapi.tiangolo.com/) for excellent Python framework
- All [contributors](https://github.com/lgtkgtv/owasp_python_security_tutorial/graphs/contributors) who help improve this tutorial

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lgtkgtv/owasp_python_security_tutorial/discussions)
- **Security Concerns**: Please report security vulnerabilities privately via GitHub Security Advisories
- **Feedback & feature requests**: Sachin Godse - lgtkgtv+sachin-godse@gmail.com

## ⭐ Star History

If this tutorial helped you learn about security, please consider giving it a star! ⭐

---

**Built with ❤️ for the security community**

*Learn. Practice. Secure.*