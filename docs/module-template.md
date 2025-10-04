# Module Template Guide

This guide will walk you through creating a new security module for the OWASP Python Security Tutorial.

## 📋 Step-by-Step Process

### Step 1: Add Module Configuration

In `src/OWASPTutorial.jsx`, add your module to the `moduleConfigs` object:

```javascript
const moduleConfigs = {
  // ... existing modules ...
  
  yourmoduleid: {
    id: 'yourmoduleid',
    title: 'Your Vulnerability Name',
    icon: Shield,  // Choose from lucide-react icons
    owasp: 'OWASP #X',
    cwe: 'CWE-XXX',
    severity: 'Critical', // Critical, High, Medium, Low
    description: 'Brief one-line description of the vulnerability',
    color: 'blue'  // red, orange, yellow, green, blue, purple
  }
};
```

**Icon Options** (from lucide-react):
- `Shield`, `Lock`, `Database`, `Eye`, `AlertCircle`, `Key`, `FileText`, `Globe`, `Server`, `Code`

### Step 2: Create Module Component

Add your module component following this template:

```javascript
// ============================================================================
// YOUR MODULE NAME
// ============================================================================

const YourModuleNameModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  // VULNERABLE CODE EXAMPLE
  const vulnerableCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/endpoint")
async def vulnerable_endpoint(user_input: str):
    """⚠️ VULNERABLE - Explain why this is vulnerable"""
    # DANGEROUS: Explain what makes this dangerous
    dangerous_code_here = user_input
    
    return {"result": dangerous_code_here}`;

  // SECURE CODE EXAMPLE
  const secureCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/endpoint")
async def secure_endpoint(user_input: str):
    """✅ SECURE - Explain the security measure"""
    # SAFE: Explain why this is safe
    safe_code_here = sanitize(user_input)
    
    return {"result": safe_code_here}`;

  // COMPARISON CODE (with inline comments)
  const comparisonCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/endpoint")
async def secure_endpoint(user_input: str):
    """✅ SECURE - Uses proper security measures"""
    
    # ❌ OLD (VULNERABLE): Explain old vulnerable approach
    # dangerous_code_here = user_input
    
    # ✅ NEW (SECURE): Explain new secure approach
    safe_code_here = sanitize(user_input)
    
    return {"result": safe_code_here}`;

  // QUIZ QUESTIONS (minimum 4)
  const quizQuestions = [
    {
      id: 1,
      question: "What makes this vulnerability possible?",
      options: [
        "Option A",
        "Option B (correct)",
        "Option C",
        "Option D"
      ],
      correct: 1,
      explanation: "Detailed explanation of why this is correct and why others are wrong."
    },
    // ... 3 more questions
  ];

  // LAB SUBMIT HANDLER
  const handleLabSubmit = () => {
    // Implement your lab logic here
    // Detect attacks, show results, etc.
    setLabResult({
      safe: false,
      message: "Attack detected!",
      impact: "Explain the impact"
    });
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* BACK BUTTON */}
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <YourIcon className="w-10 h-10 text-color-400" />
            <h1 className="text-4xl font-bold">Your Module Title</h1>
          </div>
          
          {/* PROGRESS BAR */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" 
                   style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-2 rounded-lg">
          {[
            { id: 'learn', label: 'Learn', icon: BookOpen },
            { id: 'lab', label: 'Interactive Lab', icon: Terminal },
            { id: 'quiz', label: 'Quiz', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {/* LEARN TAB */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            {/* Section 1: Understanding the Vulnerability */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              
              <p className="text-slate-300 mb-4">
                Comprehensive explanation of the vulnerability. What is it? How does it work?
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              {/* ADD ATTACK EXAMPLES TABLE HERE - See SQL Injection module for reference */}
            </div>

            {/* Section 2: Why This Matters */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              
              {/* ADD IMPACT CARDS AND DETAILED SCENARIOS - See modules for examples */}
            </div>

            {/* Section 3: How to Fix It */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>

              {/* CODE VIEW TOGGLE */}
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} 
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                        }`}>
                  Before/After Comparison
                </button>
                <button onClick={() => setCodeView('sidebyside')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                          codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                        }`}>
                  Side-by-Side View
                </button>
              </div>

              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-red-400 mb-3">❌ BEFORE:</h4>
                    <PythonCode code={vulnerableCode} />
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-3">✅ AFTER:</h4>
                    <PythonCode code={secureCode} />
                  </div>
                </div>
              )}

              {/* ADD EXPLANATION OF WHY FIX WORKS */}
            </div>

            <button
              onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {/* LAB TAB */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab</h3>
              
              {/* ADD YOUR LAB INTERFACE HERE */}
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Test Input:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try an attack..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleLabSubmit}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
                  >
                    Test
                  </button>
                </div>
              </div>

              {/* ADD RESULTS DISPLAY */}
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Ready for the Quiz? →
            </button>
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Knowledge Check Quiz
            </h3>
            <Quiz questions={quizQuestions} onComplete={() => onSectionComplete('quiz')} />
          </div>
        )}
      </div>
    </div>
  );
};
```

### Step 3: Add Router Entry

In the main component, add your module to the router:

```javascript
if (currentModule === 'yourmoduleid') {
  return <YourModuleNameModule 
    onBack={() => setCurrentModule(null)}
    onSectionComplete={(section) => saveProgress('yourmoduleid', section)}
    completedSections={moduleProgress['yourmoduleid'] || {}}
  />;
}
```

## ✅ Quality Checklist

Before submitting your module:

- [ ] Module configuration added with correct OWASP/CWE numbers
- [ ] Vulnerable code example is realistic and well-commented
- [ ] Secure code example demonstrates best practices
- [ ] Comparison code has inline ❌/✅ comments
- [ ] Learn tab has comprehensive explanation
- [ ] Attack examples table with multiple scenarios
- [ ] Real-world impact section with detailed scenarios
- [ ] Interactive lab with working demonstrations
- [ ] At least 4 quiz questions with detailed explanations
- [ ] All code uses Python syntax highlighting component
- [ ] Progress tracking works correctly
- [ ] No console errors
- [ ] Tested on mobile and desktop
- [ ] Follows existing code style and patterns

## 📚 Reference Examples

Study these existing modules for guidance:

- **SQL Injection**: Comprehensive attack table, detailed lab
- **XSS**: Multiple vulnerability types, extensive explanations
- **Broken Authentication**: Code examples, best practices

## 🎨 Design Guidelines

**Colors by Severity:**
- Critical: `red-400` to `red-500`
- High: `orange-400` to `orange-500`
- Medium: `yellow-400` to `yellow-500`
- Low: `blue-400` to `blue-500`

**Component Patterns:**
- Use existing PythonCode component for syntax highlighting
- Use Quiz component for quizzes
- Follow the 3-tab structure (Learn, Lab, Quiz)
- Include progress bars
- Use consistent spacing and padding

## 💡 Tips

1. **Start Simple**: Copy an existing module and modify it
2. **Be Comprehensive**: Don't compromise on educational content
3. **Test Thoroughly**: Try all attack examples in the lab
4. **Clear Explanations**: Assume the reader is learning this for the first time
5. **Real Examples**: Use realistic code that developers might actually write

## ❓ Need Help?

- Review existing modules in the codebase
- Ask questions in GitHub Discussions
- Reference OWASP documentation for accuracy
- Check CWE entries for technical details

---

Happy module building! 🚀