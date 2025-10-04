# Quick Start Commands

Copy and paste these commands to get your repository set up quickly.

## 🚀 Initial Setup (One-Time)

```bash
# Clone your repository
git clone https://github.com/lgtkgtv/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial

# Create directory structure
mkdir -p .github/workflows docs src public

# Copy all files from the artifacts into their respective locations
# - README.md → root
# - package.json → root
# - vite.config.js → root
# - tailwind.config.js → root
# - postcss.config.js → root
# - index.html → root
# - .gitignore → root
# - LICENSE → root
# - CONTRIBUTING.md → docs/
# - MODULE_TEMPLATE.md → docs/
# - deploy.yml → .github/workflows/
# - OWASPTutorial.jsx → src/
# - main.jsx → src/
# - index.css → src/

# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Test locally
pnpm dev
# Open http://localhost:5173

# Build for production
pnpm build

# Commit and push
git add .
git commit -m "Initial commit: Complete OWASP Python Security Tutorial"
git push origin main
```

## 📁 File Checklist

Before pushing, ensure you have:

```
✅ Root Directory:
   - README.md
   - package.json
   - vite.config.js
   - tailwind.config.js
   - postcss.config.js
   - index.html
   - .gitignore
   - LICENSE

✅ docs/
   - CONTRIBUTING.md
   - MODULE_TEMPLATE.md

✅ .github/workflows/
   - deploy.yml

✅ src/
   - OWASPTutorial.jsx
   - main.jsx
   - index.css
```

## 🔄 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Check for errors
pnpm build && pnpm preview

# Add a new dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name

# Update dependencies
pnpm update

# Remove a dependency
pnpm remove package-name
```

## 📤 Git Commands

```bash
# Check status
git status

# Add all files
git add .

# Commit with message
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main

# Create new branch
git checkout -b feature/your-feature

# Push new branch
git push origin feature/your-feature
```

## 🌐 Enable GitHub Pages

1. Go to: `https://github.com/lgtkgtv/owasp_python_security_tutorial/settings/pages`
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Wait for deployment (check Actions tab)
4. Site live at: `https://lgtkgtv.github.io/owasp_python_security_tutorial/`

## 🐛 Troubleshooting

```bash
# Clear and reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear build cache
rm -rf dist
pnpm build

# Check Node version (need 18+)
node --version

# Update pnpm
npm install -g pnpm@latest

# If pnpm isn't working, reinstall it
npm uninstall -g pnpm
npm install -g pnpm
```

## 📊 Verify Everything Works

```bash
# 1. Install pnpm
npm install -g pnpm

# 2. Install dependencies
pnpm install

# 3. Development server
pnpm dev
# ✅ Opens at http://localhost:5173
# ✅ All 3 modules visible
# ✅ Can navigate and interact

# 4. Production build
pnpm build
# ✅ Creates dist/ folder
# ✅ No errors in console

# 5. Preview production
pnpm preview
# ✅ Works same as dev

# 6. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main
# ✅ GitHub Actions runs successfully
# ✅ Site deploys to GitHub Pages
```

## 🎯 What Each File Does

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies and scripts |
| `vite.config.js` | Build tool configuration |
| `tailwind.config.js` | CSS framework configuration |
| `index.html` | HTML entry point |
| `src/main.jsx` | React entry point |
| `src/OWASPTutorial.jsx` | Main tutorial component |
| `src/index.css` | Global styles |
| `.github/workflows/deploy.yml` | Auto-deployment to GitHub Pages |
| `README.md` | Project documentation |
| `LICENSE` | MIT license |

## 🔗 Important Links

After setup:

- **Live Site**: `https://lgtkgtv.github.io/owasp_python_security_tutorial/`
- **Repository**: `https://github.com/lgtkgtv/owasp_python_security_tutorial`
- **Issues**: `https://github.com/lgtkgtv/owasp_python_security_tutorial/issues`
- **Actions**: `https://github.com/lgtkgtv/owasp_python_security_tutorial/actions`

## ✨ First Contribution Test

After setup, try adding a simple change:

```bash
# Edit README.md - add your name as maintainer
# Save file

git add README.md
git commit -m "Update maintainer information"
git push origin main

# Watch GitHub Actions deploy your change
# Visit your live site to see the update
```

---

**That's it!** Your tutorial is live and ready for the community! 🎉