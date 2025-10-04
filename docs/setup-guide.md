# Complete Setup Guide

This guide will walk you through setting up the OWASP Python Security Tutorial repository from scratch.

## 📋 Prerequisites

- Git installed on your computer
- Node.js 18+ installed
- pnpm package manager (we'll install this)
- GitHub account
- Text editor (VS Code, Sublime, etc.)

## 🚀 Step-by-Step Setup

### Step 1: Clone Your Repository

```bash
# Clone your empty repository
git clone https://github.com/lgtkgtv/owasp_python_security_tutorial.git
cd owasp_python_security_tutorial
```

### Step 2: Create Project Structure

Create the following directory structure:

```
owasp_python_security_tutorial/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── docs/
│   ├── CONTRIBUTING.md
│   └── MODULE_TEMPLATE.md
├── public/
│   └── shield.svg (optional icon)
├── src/
│   ├── OWASPTutorial.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── LICENSE
└── README.md
```

### Step 3: Create Configuration Files

**Create `.gitignore`:**
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOF
```

**Create `package.json`:**
```bash
cat > package.json << 'EOF'
{
  "name": "owasp-python-security-tutorial",
  "version": "1.0.0",
  "description": "Interactive security tutorial covering OWASP Top 10 and CWE Top 25 with Python/FastAPI examples",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/lgtkgtv/owasp_python_security_tutorial.git"
  },
  "keywords": [
    "security",
    "owasp",
    "cwe",
    "tutorial",
    "python",
    "fastapi",
    "web-security"
  ],
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://lgtkgtv.github.io/owasp_python_security_tutorial/",
  "dependencies": {
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "vite": "^5.2.0"
  }
}
EOF
```

**Create `vite.config.js`:**
```bash
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/owasp_python_security_tutorial/',
})
EOF
```

**Create `tailwind.config.js`:**
```bash
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
```

**Create `postcss.config.js`:**
```bash
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

### Step 4: Create Source Files

**Create `index.html`:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Interactive OWASP Python Security Tutorial" />
    <title>OWASP Python Security Tutorial</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Create `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
}

code {
  font-family: 'Courier New', monospace;
}

pre::-webkit-scrollbar {
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: #1e293b;
}

pre::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}
```

**Create `src/main.jsx`:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import OWASPSecurityTutorial from './OWASPTutorial.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OWASPSecurityTutorial />
  </React.StrictMode>,
)
```

**Create `src/OWASPTutorial.jsx`:**
Copy the complete tutorial component code from the artifact.

### Step 5: Create Documentation Files

Create the following files in the `docs/` directory:
- Copy `CONTRIBUTING.md` content from the artifact
- Copy `MODULE_TEMPLATE.md` content from the artifact

Create `README.md` in the root directory with the content from the artifact.

### Step 6: Create GitHub Workflow

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml` with the workflow content from the artifact.

### Step 7: Install pnpm and Dependencies

```bash
# Install pnpm globally (faster, more efficient than npm)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 8: Test Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:5173 in your browser
# Test all modules, labs, and quizzes
```

### Step 9: Build for Production

```bash
pnpm build

# Preview the production build
pnpm preview
```

### Step 10: Commit and Push

```bash
# Stage all files
git add .

# Commit
git commit -m "Initial commit: Complete OWASP Python Security Tutorial with 3 modules"

# Push to GitHub
git push origin main
```

### Step 11: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Source: `GitHub Actions`
4. Wait for the workflow to complete (check the **Actions** tab)
5. Your site will be live at: `https://lgtkgtv.github.io/owasp_python_security_tutorial/`

## 🔧 Common Issues

### Issue: Build fails with "Cannot find module"
**Solution:** Make sure all dependencies are installed:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: GitHub Pages shows 404
**Solution:** Check that:
1. The `base` in `vite.config.js` matches your repository name
2. GitHub Pages is enabled in repository settings
3. The workflow has completed successfully

### Issue: Styles not loading
**Solution:** Ensure Tailwind CSS is properly configured:
```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 📝 Next Steps

After setup is complete:

1. ✅ Test all three modules thoroughly
2. ✅ Customize the README with your information
3. ✅ Add repository topics on GitHub (security, tutorial, owasp, etc.)
4. ✅ Share with the community
5. ✅ Start accepting contributions

## 🎯 Development Workflow

```bash
# Create a new branch for features
git checkout -b feature/new-module

# Make changes and test
pnpm dev

# Build and verify
pnpm build
pnpm preview

# Commit and push
git add .
git commit -m "Add new security module"
git push origin feature/new-module

# Create Pull Request on GitHub
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## 🆘 Getting Help

- Check existing [GitHub Issues](https://github.com/lgtkgtv/owasp_python_security_tutorial/issues)
- Start a [Discussion](https://github.com/lgtkgtv/owasp_python_security_tutorial/discussions)
- Review the [Contributing Guide](docs/CONTRIBUTING.md)

---

**Congratulations!** 🎉 Your OWASP Python Security Tutorial is now live and ready to help developers learn security!

## 🔐 Security Note

This tutorial contains intentionally vulnerable code for educational purposes. The vulnerable examples should **NEVER** be used in production applications. Always follow the secure coding practices demonstrated in the "How to Fix It" sections.