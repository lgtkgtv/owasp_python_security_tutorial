import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, ChevronRight, Code, Database, Home, Shield, Terminal, Trophy, XCircle } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

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

export default SQLInjectionModule;
