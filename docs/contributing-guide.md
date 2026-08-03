# Contributing to OWASP Python Security Tutorial

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🌟 Ways to Contribute

- **Add New Security Modules**: Teach a new OWASP/CWE vulnerability
- **Improve Existing Modules**: Enhance explanations, add examples, fix bugs
- **Fix Bugs**: Help us squash bugs
- **Improve Documentation**: Better README, comments, or guides
- **Translations**: Help make this accessible to non-English speakers
- **UI/UX Improvements**: Better design and user experience

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial

# Add upstream remote
git remote add upstream https://github.com/lgtkgtv/owasp_python_security_tutorial.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies (npm ships with Node, no separate install needed)
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

## 📝 Module Development Guidelines

### Adding a New Security Module

When adding a new module, follow these principles:

#### 1. **Educational Quality**
- ✅ Explain the vulnerability thoroughly with multiple examples
- ✅ Show real-world impact and attack scenarios
- ✅ Provide comprehensive before/after code comparisons
- ✅ Include interactive labs with various attack vectors
- ✅ Create meaningful quiz questions that reinforce learning

#### 2. **Code Quality**
- ✅ Follow existing code patterns and structure
- ✅ Use proper Python syntax highlighting
- ✅ Include vulnerability markers (❌ for vulnerable, ✅ for secure)
- ✅ Write clean, well-commented code
- ✅ Use modular, reusable components

#### 3. **Content Structure**

Each module MUST include:

**Learn Tab:**
1. Understanding the Vulnerability
   - Vulnerable code example
   - Explanation of how the attack works
   - Multiple attack examples in a table
   
2. Why This Matters - Real-World Impact
   - Detailed attack scenarios
   - Real-world statistics
   - Famous breaches/victims
   
3. How to Fix It - Best Known Methods
   - Before/After code comparison
   - Side-by-side view
   - Explanation of why the fix works
   - Additional security layers

**Lab Tab:**
- Interactive testing environment
- Multiple attack examples to try
- Real-time feedback
- Explanations of results

**Quiz Tab:**
- 4+ questions testing key concepts
- Multiple choice format
- Detailed explanations for each answer
- Must align with content taught in Learn tab

### Module Template

See [MODULE_TEMPLATE.md](MODULE_TEMPLATE.md) for a complete template to copy.

### Code Standards

**React/JavaScript:**
```javascript
// Use functional components with hooks
const MyModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  // ... component logic
};

// Follow existing naming conventions
// - Components: PascalCase
// - Variables/functions: camelCase
// - Constants: UPPER_SNAKE_CASE
```

**Python Code Examples:**
```python
# Use FastAPI for all examples
from fastapi import FastAPI

# Include proper docstrings
"""⚠️ VULNERABLE - Description of vulnerability"""
"""✅ SECURE - Description of security measure"""

# Follow PEP 8 style guide
# Use type hints where appropriate
```

## 🧪 Testing Your Changes

Before submitting:

1. **Test Locally**
   ```bash
   npm run dev
   # Navigate through your module completely
   # Try all interactive features
   # Complete the quiz
   ```

2. **Build Test**
   ```bash
   npm test
   npm run build
   npm run preview
   ```

3. **Check for Errors**
   - No console errors
   - All links work
   - Progress saves correctly
   - Code highlighting works
   - Quiz validation works

## 📤 Submitting Changes

### 1. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add CSRF module with interactive examples"

# Follow conventional commits format:
# - feat: New feature
# - fix: Bug fix
# - docs: Documentation changes
# - style: Code style changes
# - refactor: Code refactoring
# - test: Test additions
```

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select base: `main` ← compare: `your-branch`
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New module
- [ ] Bug fix
- [ ] Documentation update
- [ ] UI/UX improvement

## Module Checklist (if applicable)
- [ ] Learn tab with comprehensive content
- [ ] Interactive lab with multiple examples
- [ ] Quiz with 4+ questions
- [ ] Code follows existing patterns
- [ ] All examples tested

## Screenshots (if applicable)
[Add screenshots]

## Testing
How did you test your changes?
```

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in releases

## 📋 Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Update documentation if needed
- Add yourself to contributors if it's your first PR
- Be responsive to feedback
- Be patient - reviews may take a few days

## 🎨 Style Guide

### Visual Design
- Use existing color scheme (purple/pink gradients for interactive elements)
- Maintain consistent spacing and padding
- Use Lucide icons for consistency
- Follow mobile-first responsive design

### Content Writing
- Use clear, concise language
- Write for developers learning security
- Include code comments explaining WHY, not just WHAT
- Use active voice
- Provide specific examples over general statements

## ❓ Questions?

- **General Questions**: [GitHub Discussions](https://github.com/lgtkgtv/owasp_python_security_tutorial/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues)
- **Security Concerns**: Use GitHub Security Advisories

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- No harassment or discrimination

## 🏆 Recognition

Contributors will be:
- Listed in GitHub contributors
- Mentioned in release notes
- Credited in the README (for significant contributions)

Thank you for helping make web development more secure! 🔐

---

*Happy Contributing!* 🎉