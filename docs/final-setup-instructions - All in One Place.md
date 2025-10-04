# Complete Setup Instructions - All in One Place

Follow these steps to get your OWASP Python Security Tutorial up and running.

## 🎯 Quick Overview

1. Run automated setup script (creates all config files)
2. Copy OWASPTutorial.jsx component from artifact
3. Install pnpm and dependencies
4. Test locally
5. Push to GitHub

## 📝 Step-by-Step Instructions

### Step 1: Run the Automated Setup Script

```bash
# Navigate to your project directory
cd ~/projects/owasp_python_security_tutorial

# Create and run the setup script
curl -o setup.sh https://raw.githubusercontent.com/lgtkgtv/owasp_python_security_tutorial/main/setup.sh
chmod +x setup.sh
./setup.sh
```

**OR manually create the setup script:**

```bash
# Copy the complete-setup.sh content from the artifact
# Save it as setup.sh
# Then run:
chmod +x setup.sh
./setup.sh
```

This script will create:
- ✅ All configuration files (package.json, vite.config.js, etc.)
- ✅ Directory structure (.github/workflows, docs, src)
- ✅ Base source files (main.jsx, index.css)
- ✅ GitHub Actions workflow
- ✅ LICENSE file
- ✅ Placeholder OWASPTutorial.jsx (needs to be replaced)

### Step 2: Copy the OWASPTutorial.jsx Component

This is the most important step! The main tutorial component is in the artifact.

**Option A: Using Artifact Viewer (Recommended)**

1. Look at the Claude conversation above
2. Find the artifact named **"sql-injection-tutorial"** 
3. Click to expand it (you'll see the interactive tutorial interface)
4. Look for a **copy button** or **view source** option
5. Copy ALL the code (it's ~2000 lines)
6. Create/replace the file:

```bash
# Open in your preferred editor
code src/OWASPTutorial.jsx  # VS Code
# OR
nano src/OWASPTutorial.jsx  # Terminal editor
# OR
vim src/OWASPTutorial.jsx   # Vim
```

7. **Delete** the placeholder content
8. **Paste** the complete artifact code
9. **Save** the file

**Option B: If You Can't Access the Artifact**

Reply to Claude asking: *"Can you provide the OWASPTutorial.jsx component code in chunks?"*

I'll break it down into manageable pieces you can copy sequentially.

**Verify the file:**

```bash
# Check file size (should be ~75-90 KB)
ls -lh src/OWASPTutorial.jsx

# Check line count (should be ~2000-2500 lines)
wc -l src/OWASPTutorial.jsx

# Check it starts correctly
head -3 src/OWASPTutorial.jsx
# Should show:
# import React, { useState, useEffect } from 'react';
# import { AlertCircle, CheckCircle, ... } from 'lucide-react';

# Check it ends correctly  
tail -1 src/OWASPTutorial.jsx
# Should show:
# export default OWASPSecurityTutorial;
```

### Step 3: Install pnpm and Dependencies

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Verify pnpm is installed
pnpm --version
# Should show 8.x or higher

# Install project dependencies
pnpm install

# This will install:
# - React and React DOM
# - Vite (build tool)
# - Tailwind CSS (styling)
# - Lucide React (icons)
# - PostCSS and Autoprefixer
```

### Step 4: Test Locally

```bash
# Start the development server
pnpm dev

# You should see:
# ➜  Local:   http://localhost:5173/owasp_python_security_tutorial/
# ➜  press h to show help
```

**Open your browser to `http://localhost:5173/owasp_python_security_tutorial/`**

You should see:
- ✅ Three module cards (SQL Injection, XSS, Broken Authentication)
- ✅ Progress tracking dashboard
- ✅ Dark purple gradient background
- ✅ Can click into modules and navigate tabs

**Test each module:**
- Click "SQL Injection" → Try the Learn tab → Try the Lab → Try the Quiz
- Go back and test the other two modules

### Step 5: Create Documentation Files

Copy these from the artifacts into your `docs/` folder:

```bash
# Copy CONTRIBUTING.md content from artifact to:
# docs/CONTRIBUTING.md

# Copy MODULE_TEMPLATE.md content from artifact to:
# docs/MODULE_TEMPLATE.md

# Copy README.md content from artifact to:
# README.md (root directory)
```

### Step 6: Build for Production

```bash
# Build the production version
pnpm build

# You should see:
# ✓ built in XXXms
# ✓ dist/ folder created

# Preview the production build
pnpm preview

# Should open at http://localhost:4173
# Test that everything still works
```

### Step 7: Commit and Push

```bash
# Check what will be committed
git status

# Should show:
# - All config files
# - src/ directory
# - docs/ directory  
# - .github/workflows/
# - LICENSE, README.md

# Add all files
git add .

# Commit with descriptive message
git commit -m "Initial commit: Complete OWASP Python Security Tutorial with 3 modules

- Added SQL Injection module with comprehensive examples
- Added XSS module covering Reflected, Stored, and DOM-based
- Added Broken Authentication module
- Configured Vite + React + Tailwind
- Set up GitHub Actions for automatic deployment
- Added contribution guidelines and module template"

# Push to GitHub
git push origin main
```

### Step 8: Enable GitHub Pages

1. Go to your repository: `https://github.com/lgtkgtv/owasp_python_security_tutorial`

2. Click **Settings** (top menu)

3. Click **Pages** (left sidebar)

4. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"**

5. Go to the **Actions** tab and watch the deployment

6. Once complete (green checkmark), your site is live at:
   `https://lgtkgtv.github.io/owasp_python_security_tutorial/`

## 🎉 You're Done!

Your tutorial is now:
- ✅ Running locally at http://localhost:5173
- ✅ Deployed to GitHub Pages
- ✅ Auto-deploying on every push to main
- ✅ Ready for contributions

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module 'react'"
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Build fails with Tailwind errors
```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Issue: GitHub Pages shows 404
- Check that base URL in `vite.config.js` matches your repo name
- Verify GitHub Actions workflow completed successfully
- Wait a few minutes for DNS propagation

### Issue: Artifact viewer not showing component
- Scroll up in the Claude conversation
- Look for "sql-injection-tutorial" artifact
- Try refreshing the page
- Ask Claude to provide the code in chunks if needed

### Issue: pnpm command not found
```bash
# Reinstall pnpm
npm uninstall -g pnpm
npm install -g pnpm

# Verify
pnpm --version
```

## 📚 File Structure Summary

```
owasp_python_security_tutorial/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions config
├── docs/
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── MODULE_TEMPLATE.md      # Module creation guide
├── src/
│   ├── OWASPTutorial.jsx      # Main component (2000+ lines)
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── package.json               # Dependencies
├── vite.config.js            # Build config
├── tailwind.config.js        # CSS config
└── postcss.config.js         # PostCSS config
```

## 🚀 Next Steps

1. **Customize** the README with your name/info
2. **Add topics** to your GitHub repo (security, owasp, tutorial, python)
3. **Share** with the community
4. **Accept contributions** from other developers
5. **Add more modules** using the MODULE_TEMPLATE.md guide

## 📞 Need Help?

- **Can't find the artifact?** → Scroll up in the Claude conversation
- **Component code issues?** → Ask Claude for the code in chunks
- **Build errors?** → Share the error message with Claude
- **Questions?** → Just ask!

## 🎓 What You've Built

You now have a complete, production-ready security education platform with:
- 3 comprehensive security modules
- Interactive labs for hands-on learning
- Progress tracking
- Beautiful, responsive UI
- Auto-deployment via GitHub Actions
- Community-ready documentation

**Congratulations!** 🎉

---

**Pro Tip**: Bookmark this page for future reference, and star your own repo to track its progress!