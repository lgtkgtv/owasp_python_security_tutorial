#!/bin/bash

# Complete OWASP Python Security Tutorial Setup Script
# This script automates the entire repository setup process

set -e  # Exit on error

echo "🚀 OWASP Python Security Tutorial - Complete Setup"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [[ ! $(basename $(pwd)) == "owasp_python_security_tutorial" ]]; then
    echo "❌ Error: Please run this script from the owasp_python_security_tutorial directory"
    exit 1
fi

# Step 1: Create directory structure
echo "📁 Creating directory structure..."
mkdir -p .github/workflows docs src public

# Step 2: Create configuration files
echo "⚙️  Creating configuration files..."

# package.json
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
  "keywords": ["security", "owasp", "cwe", "tutorial", "python", "fastapi"],
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://lgtkgtv.github.io/owasp_python_security_tutorial/",
  "dependencies": {
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "vite": "^5.2.0"
  }
}
EOF

# vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/owasp_python_security_tutorial/',
})
EOF

# tailwind.config.js
cat > tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

# postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
*.log
.env.local
.vscode/*
!.vscode/extensions.json
pnpm-lock.yaml
EOF

# index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Interactive OWASP Python Security Tutorial - Learn by Doing" />
    <meta name="keywords" content="OWASP, security, Python, FastAPI, SQL injection, XSS, tutorial" />
    <title>OWASP Python Security Tutorial - Learn by Doing</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Step 3: Create source files
echo "📝 Creating source files..."

# src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

pre::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
EOF

# src/main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import OWASPSecurityTutorial from './OWASPTutorial.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OWASPSecurityTutorial />
  </React.StrictMode>,
)
EOF

# Step 4: Create GitHub workflow
echo "🔄 Creating GitHub Actions workflow..."

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
      
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

# Step 5: Create LICENSE
echo "📄 Creating LICENSE..."

cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 OWASP Python Security Tutorial Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Step 6: Create placeholder for OWASPTutorial.jsx
echo "📦 Creating placeholder for OWASPTutorial.jsx..."

cat > src/OWASPTutorial.jsx << 'EOF'
// ============================================================================
// OWASP Security Tutorial Component
// ============================================================================
// 
// ⚠️  PLACEHOLDER FILE - REPLACE WITH ACTUAL COMPONENT
// 
// This is a placeholder. You need to:
// 1. Copy the complete component code from the 'sql-injection-tutorial' artifact
// 2. Paste it here, replacing this entire file
// 
// The artifact contains ~2000 lines of complete React component code
// including all three modules (SQL Injection, XSS, Broken Authentication)
// ============================================================================

import React from 'react';

const OWASPSecurityTutorial = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        textAlign: 'center',
        background: 'rgba(30, 41, 59, 0.5)',
        padding: '3rem',
        borderRadius: '1rem',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          ⚠️ Component Not Loaded
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#cbd5e1' }}>
          Please replace this placeholder with the actual OWASPTutorial.jsx component code
        </p>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.5)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fca5a5' }}>
            📋 Instructions:
          </h2>
          <ol style={{ fontSize: '0.95rem', lineHeight: '1.8', color: '#e2e8f0' }}>
            <li>Locate the artifact named 'sql-injection-tutorial' in Claude</li>
            <li>Copy the complete component code from that artifact</li>
            <li>Replace the entire contents of src/OWASPTutorial.jsx with that code</li>
            <li>Save the file</li>
            <li>Restart the dev server: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>pnpm dev</code></li>
          </ol>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#94a3b8' }}>
          See the EXTRACT_COMPONENT.md guide for detailed instructions
        </p>
      </div>
    </div>
  );
};

export default OWASPSecurityTutorial;
EOF

# Step 7: Summary
echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Copy the OWASPTutorial.jsx component:"
echo "   - Find the 'sql-injection-tutorial' artifact in Claude"
echo "   - Copy the complete code"
echo "   - Replace src/OWASPTutorial.jsx with that code"
echo ""
echo "2. Install pnpm (if not already installed):"
echo "   npm install -g pnpm"
echo ""
echo "3. Install dependencies:"
echo "   pnpm install"
echo ""
echo "4. Start development server:"
echo "   pnpm dev"
echo ""
echo "5. Test in browser:"
echo "   Open http://localhost:5173"
echo ""
echo "6. Build and deploy:"
echo "   pnpm build"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push origin main"
echo ""
echo "📚 Documentation created in docs/"
echo "🔄 GitHub workflow created in .github/workflows/"
echo ""
echo "⚠️  Don't forget to copy the OWASPTutorial.jsx component!"
echo ""