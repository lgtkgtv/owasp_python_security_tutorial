# Creating src/OWASPTutorial.jsx

The complete tutorial component is currently in the artifact viewer. Here's how to extract it:

## Method 1: Copy from Artifact Viewer (Easiest)

1. **Locate the artifact** named `sql-injection-tutorial` in the artifact panel (should be visible in your Claude conversation)

2. **Click on the artifact** to view it in full

3. **Look for the copy button** in the artifact viewer (usually top-right corner)

4. **Copy all the code** - The artifact contains the complete React component code

5. **Create the file and paste:**
   ```bash
   cd ~/projects/owasp_python_security_tutorial/src
   
   # Create the file
   touch OWASPTutorial.jsx
   
   # Open in your editor
   code OWASPTutorial.jsx  # VS Code
   # OR
   nano OWASPTutorial.jsx  # Terminal editor
   # OR
   vim OWASPTutorial.jsx   # Vim
   ```

6. **Paste the complete code** from the artifact into this file

7. **Save the file**

## Method 2: Manual Creation (If Copy Doesn't Work)

If you can't copy from the artifact viewer, I can provide the component in smaller chunks. Let me know and I'll break it down into manageable pieces.

## Method 3: Create via Terminal (Scripted)

Since the file is very large (~2000+ lines), here's a helper script approach:

```bash
# Create a temporary file to store the component
cat > /tmp/create_component.sh << 'SCRIPT'
#!/bin/bash
# You'll need to manually paste the artifact content
# after running this script

echo "Creating src/OWASPTutorial.jsx..."
read -p "Press Enter after you've copied the artifact content to your clipboard..."

cat > src/OWASPTutorial.jsx << 'EOF'
# PASTE THE ARTIFACT CONTENT HERE
# This is where you'll manually paste from the artifact viewer
EOF

echo "✅ File created! Verify with: wc -l src/OWASPTutorial.jsx"
SCRIPT

chmod +x /tmp/create_component.sh
/tmp/create_component.sh
```

## Verification

After creating the file, verify it's correct:

```bash
# Check file exists and has content
ls -lh src/OWASPTutorial.jsx

# Should show ~2000+ lines
wc -l src/OWASPTutorial.jsx

# Check if it starts with import statements
head -5 src/OWASPTutorial.jsx

# Should see something like:
# import React, { useState, useEffect } from 'react';
# import { AlertCircle, CheckCircle, XCircle, Shield, ...
```

## Structure Check

The file should have this general structure:

```javascript
import React, { useState, useEffect } from 'react';
import { /* ...icons... */ } from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const PythonCode = ({ code, className = "" }) => {
  // ... syntax highlighter
};

const Quiz = ({ questions, onComplete }) => {
  // ... quiz component
};

// ============================================================================
// MODULE CONFIGURATIONS
// ============================================================================

const moduleConfigs = {
  sqlinjection: { /* ... */ },
  xss: { /* ... */ },
  brokenauth: { /* ... */ }
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

const OWASPSecurityTutorial = () => {
  // ... main component
};

// ============================================================================
// SQL INJECTION MODULE
// ============================================================================

const SQLInjectionModule = ({ onBack, onSectionComplete, completedSections }) => {
  // ... SQL injection module
};

// ============================================================================
// XSS MODULE
// ============================================================================

const XSSModule = ({ onBack, onSectionComplete, completedSections }) => {
  // ... XSS module
};

// ============================================================================
// BROKEN AUTHENTICATION MODULE
// ============================================================================

const BrokenAuthModule = ({ onBack, onSectionComplete, completedSections }) => {
  // ... broken auth module
};

export default OWASPSecurityTutorial;
```

## Common Issues

### Issue: "Cannot find module" error
**Solution:** Make sure the file is named exactly `OWASPTutorial.jsx` (case-sensitive)

### Issue: Syntax errors
**Solution:** Ensure you copied the ENTIRE artifact content, including the first and last lines

### Issue: File seems incomplete
**Solution:** The file should be approximately:
- ~2000-2500 lines of code
- ~75-90 KB in size
- Ends with `export default OWASPSecurityTutorial;`

## Test the Component

After creating the file:

```bash
# Try to start the dev server
pnpm dev

# If successful, you'll see:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help

# Open the browser and verify:
# ✅ Three module cards appear
# ✅ Can click into SQL Injection module
# ✅ All tabs work (Learn, Lab, Quiz)
```

## Alternative: I Can Provide the Code in Chunks

If the artifact viewer isn't working for you, I can break down the component into smaller, manageable code blocks that you can copy and paste sequentially. Just let me know!

## Need Help?

If you're having trouble:
1. Make sure you're looking at the correct artifact (named `sql-injection-tutorial`)
2. The artifact should show a dark-themed interactive tutorial interface
3. Try refreshing the page to ensure the artifact is fully loaded
4. Let me know if you need me to provide the code in smaller chunks