# OWASP Python Security Tutorial

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Interactive, hands-on security tutorial covering OWASP Top 10 and CWE Top 25 vulnerabilities with FastAPI/Python examples.

[Live Demo](https://lgtkgtv.github.io/owasp_python_security_tutorial/) | [Report Bug](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues) | [Request Module](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues)

## 🎯 Overview

This is a comprehensive, **interactive security education platform** designed to teach developers about web application vulnerabilities through hands-on learning. Each module covers a critical security vulnerability from the OWASP Top 10 and CWE Top 25.

### Why This Tutorial?

- ✅ **Learn by Doing** - Interactive labs where you can safely exploit and fix vulnerabilities
- ✅ **Production-Ready Code** - All examples use FastAPI with real security best practices
- ✅ **Comprehensive Coverage** - Vulnerable code → Explanation → Fix → Quiz reinforcement
- ✅ **Visual Learning** - Syntax-highlighted code with before/after comparisons
- ✅ **Progress Tracking** - Save your progress as you complete modules
- ✅ **Community-Driven** - Open source and accepting contributions

## 📚 Current Modules

| Module | OWASP | CWE | Severity | Status |
|--------|-------|-----|----------|--------|
| SQL Injection | #3 | CWE-89 | Critical | ✅ Complete |
| Cross-Site Scripting (XSS) | #3 | CWE-79 | High | ✅ Complete |
| Broken Authentication | #7 | CWE-287 | Critical | ✅ Complete |

### Planned Modules

- [ ] Cross-Site Request Forgery (CSRF) - CWE-352
- [ ] Path Traversal - CWE-22
- [ ] Command Injection - CWE-78
- [ ] Insecure Deserialization - CWE-502
- [ ] XML External Entities (XXE) - CWE-611
- [ ] Server-Side Request Forgery (SSRF) - CWE-918
- [ ] Security Misconfiguration - OWASP #5
- [ ] Sensitive Data Exposure - CWE-311

[Vote for the next module →](https://github.com/lgtkgtv/owasp_python_security_tutorial/discussions)

## 🚀 Quick Start

### For Learners (Use the Tutorial)

Simply visit the [live tutorial](https://lgtkgtv.github.io/owasp_python_security_tutorial/) - no installation needed!

### For Contributors (Local Development)

```bash
# Clone the repository
git clone https://github.com/lgtkgtv/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:5173 in your browser
```

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
├── src/
│   ├── OWASPTutorial.jsx       # Main application component
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── public/
│   └── index.html              # HTML template
├── docs/
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── MODULE_TEMPLATE.md      # Template for new modules
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Package Manager**: pnpm (fast, disk-efficient)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: GitHub Pages
- **Backend Examples**: FastAPI (Python)

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New security modules
- 🎨 UI/UX enhancements
- 🌐 Translations

Please read our [Contributing Guide](docs/CONTRIBUTING.md) and [Module Template](docs/MODULE_TEMPLATE.md) to get started.

### Adding a New Module

1. Review the [Module Template](docs/MODULE_TEMPLATE.md)
2. Create your module following the existing pattern
3. Add it to the module configuration
4. Test thoroughly
5. Submit a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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