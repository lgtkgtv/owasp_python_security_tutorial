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
| Cross-Site Request Forgery (CSRF)    | A01:2021        | CWE-352  | High     | ✅ Complete |
| Path Traversal                       | A01:2021        | CWE-22   | High     | ✅ Complete |
| Command Injection                    | A03:2021        | CWE-78   | Critical | ✅ Complete |
| Insecure Deserialization             | A08:2021        | CWE-502  | Critical | ✅ Complete |
| XML External Entities (XXE)          | A05:2021        | CWE-611  | High     | ✅ Complete |
| Server-Side Request Forgery (SSRF)   | A10:2021        | CWE-918  | High     | ✅ Complete |
| Security Misconfiguration            | A05:2021        | Multiple | Medium   | ✅ Complete |
| Sensitive Data Exposure              | A02:2021        | CWE-311  | High     | ✅ Complete |

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

All 21 modules (11 web + 10 AI/LLM) follow the same Learn → Interactive Lab → Quiz structure. Note: unlike the web
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

There is currently **no automated test suite** in this repo (no Jest/Vitest/Playwright configured yet - see Critique).
`pnpm build` is the only automated check today, and it only catches syntax/JSX errors, not broken logic. Until real
tests exist, treat this checklist as "testing" any change or new module:

- [ ] `pnpm build` completes with no errors
- [ ] Every module card on the home page opens
- [ ] Learn tab: vulnerable/secure/comparison code blocks render; the "Before/After" ↔ "Side-by-Side" toggle works
- [ ] Interactive Lab: try each attack input listed in that module's own "Attack Examples" table and confirm the
      labeled vulnerable/blocked outcome appears
- [ ] Quiz: answer all questions, confirm the score and explanations display, and confirm a wrong answer does
      **not** mark the module complete
- [ ] Refresh the page - completion badges and the "Modules Completed" stat should still reflect progress
      (backed by `localStorage`)
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

## 🏗️ Project Structure

```
owasp_python_security_tutorial/
├── index.html                  # HTML entry point (Vite root - not under public/)
├── src/
│   ├── OWASPTutorial.jsx       # Main app - all 21 modules (both tracks) live in this one file (see Critique)
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── docs/
│   ├── contributing-guide.md   # Contribution guidelines
│   ├── module-template.md      # Template for new modules
│   └── ...                     # Setup guides (some overlapping - see Critique)
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment (build + publish on push to main)
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── license.md                  # MIT license
└── README.md                   # This file
```

## 🧱 Tech Stack & Why It Was Chosen

This project optimizes for two things above all else: **zero install for learners** and **fast iteration for one
maintainer writing many similar modules**. Every choice below follows from that.

| Layer            | Choice                          | Why It Fits This Project                                                                                                                                     |
|-------------------|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| UI framework      | React 18 (function components + hooks) | Every module has the same shape (Learn/Lab/Quiz tabs + progress state) - hooks make that repeated pattern trivial to copy and reason about                     |
| Build tool        | Vite                            | Near-instant hot reload while iterating on markup-heavy modules; produces a plain static `dist/` folder GitHub Pages can serve as-is                            |
| Styling           | Tailwind CSS (utility classes)  | Lets one person restyle and duplicate 21 near-identical module layouts without hand-maintaining a growing separate stylesheet                                  |
| Icons             | lucide-react                    | Tree-shakeable (only the icons a module imports ship in the bundle), one consistent stroke-style icon set                                                       |
| Hosting           | GitHub Pages + GitHub Actions    | Free static hosting, nothing to patch or pay for, deploys automatically on every push to `main` via `deploy.yml`                                                 |
| "Backend"         | None - simulated in the browser | The FastAPI/Python code shown is real, but it is never executed. Labs simulate what it would do using plain JS - this keeps the whole tutorial static and unhackable (there's no live server to actually attack), at the cost of the labs being an approximation rather than a real target (see Critique) |
| Example language  | Python + FastAPI (+ OpenAI SDK for the AI/LLM track) | Modern, type-hinted, widely taught; `async def` signatures with type hints make vulnerable-vs-fixed diffs easy to scan, and the OpenAI SDK is the most broadly recognized pattern for the LLM modules |
| Persistence       | Browser `localStorage`          | Progress tracking needs no account system or database for a single-user, static-site tutorial                                                                   |
| Architecture      | One file, one component per module | Fastest way for a single maintainer to get started, and matches the "copy an existing module" contribution model in `docs/module-template.md` - also the choice most in tension with long-term maintainability as the project grows (see Critique) |

In short: every layer was picked to keep the project **free to run, free to host, and safe by construction**, while
staying simple enough for one person to keep extending it module by module.

## 🔍 Honest Critique

Candid, warts-and-all feedback on the project as it stands - so contributors (and the maintainer) have a clear list
of what to improve next, not just a features list.

**Content & coverage.** Strong overlap with both the OWASP Top 10 (2021) and the CWE Top 25 in the web track's 11 modules, spanning
injection (SQLi, Command Injection, XXE), authentication/session handling, client-side risks (XSS, CSRF), and
infrastructure-adjacent issues (SSRF, Security Misconfiguration, Sensitive Data Exposure, Insecure Deserialization,
Path Traversal). The single biggest gap: there's no dedicated **Broken Access Control / IDOR** module (e.g.
`GET /orders/123` returning someone else's order because the API never checks ownership). That's OWASP's #1-ranked
category in the 2021 list and arguably the most common real-world API bug - Broken Authentication covers
*authenticating*, not *authorizing*, so this is a real hole. Also missing: **Vulnerable and Outdated Components**
(OWASP A06 - dependency/SCA scanning, `pip-audit`/`safety`, lockfile pinning) and **Security Logging & Monitoring
Failures** (OWASP A09) - both are easy to demo and commonly tested in real audits/interviews.

**Usefulness.** Genuinely useful as a first, intuitive pass at "why is this dangerous and what's the fix," especially
for developers who've never seen a real exploit. The weakest link is *how* the labs detect an "attack": most check
input against a list of suspicious substrings/regex (`;`, `..`, `__reduce__`, etc.). That's a reasonable simulation,
but it risks teaching the wrong mental model - real defenses like parameterized queries or `shell=False` don't work
by *detecting* bad input, they work by making that whole *class* of input structurally impossible. A learner who
walks away thinking "security = pattern-matching bad strings" has learned the exact anti-pattern (denylisting) that
each module's own "How to Fix It" section correctly argues against. A one-line callout in each Lab tab ("this
simulation approximates detection for teaching purposes - the real fix works differently, as shown above") would
close that gap.

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

**Architecture & code quality.** Everything lives in one `src/OWASPTutorial.jsx` file, now over 9,000 lines across
21 module components. That was a reasonable way to get started (see Tech Stack above), but the growth from 11 to 21
modules makes the cost concrete rather than hypothetical: `vite build` now emits a single ~540 KB JS bundle and
explicitly warns that it exceeds Rollup's recommended chunk-size threshold, meaning every learner downloads all 21
modules' code just to open one. Every future contribution also touches this same giant file, which will produce
merge conflicts the moment more than one person adds a module at a time. Splitting each module into its own file
under `src/modules/` and lazy-loading it per-route would fix both problems without changing the UI at all - this is
now the single highest-leverage refactor available to this project.

**Other missing topics.** Rate limiting / brute-force & API abuse as its own module (currently just a code snippet
inside Broken Authentication); security headers beyond CORS (CSP, HSTS, X-Frame-Options, `Permissions-Policy`);
dedicated secrets management (env vars vs. vaults vs. secrets accidentally committed to git history) beyond the
brief mention inside Sensitive Data Exposure; and an automated test suite (see the Test section above).

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

## ⭐ Star History

If this tutorial helped you learn about security, please consider giving it a star! ⭐

---

**Built with ❤️ for the security community**

*Learn. Practice. Secure.*