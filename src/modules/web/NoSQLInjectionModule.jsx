import React, { useState } from 'react';
import { AlertCircle, Braces, BookOpen, CheckCircle, ChevronRight, Code, Home, Shield, Terminal, Trophy, XCircle } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const NoSQLInjectionModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const mockUser = { username: 'admin', password: 'secret123', email: 'admin@example.com' };

  const vulnerableCode = `from fastapi import FastAPI
from pymongo import MongoClient

app = FastAPI()
db = MongoClient().app

@app.post("/login")
async def login(credentials: dict):
    """⚠️ VULNERABLE - DO NOT USE IN PRODUCTION"""
    # DANGEROUS: the JSON body's fields are passed straight into the
    # MongoDB filter, with no check that they're actually strings.
    user = db.users.find_one({
        "username": credentials["username"],
        "password": credentials["password"]
    })

    if user:
        return {"authenticated": True, "user": user["username"]}
    return {"authenticated": False}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
from pymongo import MongoClient

app = FastAPI()
db = MongoClient().app

@app.post("/login")
async def login(credentials: dict):
    """✅ SECURE - Rejects anything that isn't a plain string"""
    username, password = credentials.get("username"), credentials.get("password")

    # SAFE: reject the request outright if either field isn't a string.
    # A dict like {"$ne": null} is rejected here, before it ever reaches
    # the query -- it can never be interpreted as a query operator.
    if not isinstance(username, str) or not isinstance(password, str):
        raise HTTPException(status_code=400, detail="Invalid credentials format")

    user = db.users.find_one({"username": username, "password": password})

    if user:
        return {"authenticated": True, "user": user["username"]}
    return {"authenticated": False}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
from pymongo import MongoClient

app = FastAPI()
db = MongoClient().app

@app.post("/login")
async def login(credentials: dict):
    """✅ SECURE - Rejects anything that isn't a plain string"""
    username, password = credentials.get("username"), credentials.get("password")

    # ❌ OLD (VULNERABLE): fields passed straight into the query, no type check
    # user = db.users.find_one({
    #     "username": credentials["username"],
    #     "password": credentials["password"]
    # })

    # ✅ NEW (SECURE): reject anything that isn't a plain string first
    if not isinstance(username, str) or not isinstance(password, str):
        raise HTTPException(status_code=400, detail="Invalid credentials format")

    user = db.users.find_one({"username": username, "password": password})

    if user:
        return {"authenticated": True, "user": user["username"]}
    return {"authenticated": False}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What makes NoSQL injection possible in a MongoDB-backed API?",
      options: [
        "MongoDB doesn't support authentication",
        "Passing a user-controlled JSON value straight into a query filter without checking its type",
        "Using an outdated MongoDB version",
        "Not using HTTPS"
      ],
      correct: 1,
      explanation: "If the API accepts arbitrary JSON and passes fields directly into a MongoDB filter, an attacker can send an object (like {\"$ne\": null}) instead of a plain string, turning a value into a query operator."
    },
    {
      id: 2,
      question: 'Why does sending {"password": {"$ne": null}} bypass a login check?',
      options: [
        "It guesses the real password",
        "$ne (\"not equal\") matches any password field that isn't null, which is true for every real user",
        "It crashes the database",
        "It deletes the password field"
      ],
      correct: 1,
      explanation: "$ne is a MongoDB comparison operator. \"password is not equal to null\" is true for any account that has a password set at all, so the filter matches regardless of the actual password."
    },
    {
      id: 3,
      question: "What is the primary defense against this class of NoSQL injection?",
      options: [
        "Encrypting the database",
        "Validating that user-supplied fields are the expected primitive type (e.g. a string) before using them in a query",
        "Using a stronger MongoDB password",
        "Rate limiting the login endpoint"
      ],
      correct: 1,
      explanation: "Type-checking user input before it reaches the query is the fix: rejecting a dict/object where a string is expected means an attacker can never smuggle in a query operator."
    },
    {
      id: 4,
      question: "LDAP injection is a related attack against directory services (like Active Directory). What do LDAP and NoSQL injection have in common?",
      options: [
        "Both require SQL syntax",
        "Both let attacker-controlled input change the structure/logic of a query, not just its data, because special characters or object structure are interpreted as query syntax",
        "Both only affect authentication endpoints",
        "Neither is exploitable if HTTPS is used"
      ],
      correct: 1,
      explanation: "LDAP filters use characters like * ( ) | & to build search logic (e.g. (&(uid={username})(userPassword={password}))), and unescaped user input can inject extra filter clauses -- the same root cause as NoSQL injection: user input reinterpreted as query structure instead of a literal value."
    }
  ];

  const handleLabSubmit = () => {
    const trimmed = labInput.trim();
    let result = { safe: false };

    const looksLikeOperatorInjection = /\{.*\$(ne|gt|gte|lt|lte|regex|exists|in)\b/i.test(trimmed);

    if (looksLikeOperatorInjection) {
      result.query = `db.users.find_one({"username": "admin", "password": ${trimmed}})`;
      result.message = '⚠️ NoSQL Injection Detected!';

      if (/\$ne/i.test(trimmed)) {
        result.authenticated = true;
        result.impact = '🔓 CRITICAL: Authentication bypassed! $ne ("not equal") matches any password value that isn\'t exactly the operand given, and every real account has SOME password set -- so this condition is true for admin without knowing the real password.';
      } else if (/\$gt/i.test(trimmed) || /\$gte/i.test(trimmed)) {
        result.authenticated = true;
        result.impact = '🔓 CRITICAL: Authentication bypassed! $gt/$gte ("greater than") against an empty string matches any non-empty password, since MongoDB compares strings lexicographically.';
      } else if (/\$regex/i.test(trimmed)) {
        result.authenticated = true;
        result.impact = '🔓 CRITICAL: Authentication bypassed via regex! A pattern like ".*" matches any string, so the password check always succeeds regardless of the real password.';
      } else if (/\$exists/i.test(trimmed)) {
        result.authenticated = true;
        result.impact = '🔓 CRITICAL: Authentication bypassed! $exists just checks that the password field is present at all -- true for every real account.';
      } else {
        result.authenticated = false;
        result.impact = '⚠️ This uses NoSQL operator syntax, but not one this lab specifically models a bypass for.';
      }
    } else {
      result.query = `db.users.find_one({"username": "admin", "password": "${trimmed}"})`;
      if (trimmed === mockUser.password) {
        result.authenticated = true;
        result.message = '✅ Correct password - authenticated normally';
        result.safe = true;
      } else {
        result.authenticated = false;
        result.message = '❌ Incorrect password';
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
            <Braces className="w-10 h-10 text-red-400" />
            <h1 className="text-4xl font-bold">NoSQL / LDAP Injection</h1>
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
                NoSQL databases like MongoDB accept queries as JSON-like documents rather than SQL strings. If an API
                passes a user-supplied JSON field directly into a query filter without checking its type, an attacker
                can send an <em>object</em> (a query operator) instead of the plain string the developer expected --
                turning a value into logic.
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
                      <p className="font-semibold text-purple-300">Normal Request Body</p>
                      <p className="text-sm text-slate-400">
                        <code className="bg-slate-800 px-2 py-1 rounded">{'{"username": "admin", "password": "secret123"}'}</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-300">
                        Malicious Body: {'{"username": "admin", "password": {"$ne": null}}'}
                      </p>
                      <p className="text-sm text-red-400 mt-1">
                        ⚠️ $ne ("not equal") matches any password that isn't null -- always true for a real account!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
                <h4 className="font-bold mb-3">Attack Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Operator</th>
                        <th className="text-left p-2 text-purple-400">Malicious Value</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">$ne</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">{'{"$ne": null}'}</code></td>
                        <td className="p-2 text-slate-300">Matches any non-null password - login bypass</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">$gt</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">{'{"$gt": ""}'}</code></td>
                        <td className="p-2 text-slate-300">Matches any non-empty password - login bypass</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-yellow-400">$regex</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">{'{"$regex": ".*"}'}</code></td>
                        <td className="p-2 text-slate-300">Matches everything - login bypass</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-purple-400">$exists</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">{'{"$exists": true}'}</code></td>
                        <td className="p-2 text-slate-300">Matches any account that has a password set</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="font-bold text-blue-300 mb-2">🔗 Related: LDAP Injection</h4>
                <p className="text-sm text-slate-300 mb-2">
                  LDAP (used by Active Directory and other directory services) has the same root cause via a different
                  syntax. A login filter like <code className="bg-slate-800 px-1 rounded">(&(uid={'{username}'})(userPassword={'{password}'}))</code> uses
                  special characters (<code className="bg-slate-800 px-1 rounded">* ( ) | &amp;</code>) to build search logic. Unescaped user
                  input like <code className="bg-slate-800 px-1 rounded">*)(uid=*))(|(uid=*</code> can inject extra filter clauses and
                  short-circuit the check, the same way a Mongo operator does here.
                </p>
                <p className="text-sm text-slate-400">
                  The fix is identical in spirit: never let user input be interpreted as query structure. For LDAP,
                  that means escaping the RFC 4515 special characters before building the filter string; for NoSQL,
                  it means rejecting anything that isn't the primitive type you expect.
                </p>
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
                    Attackers log in as any user, including admins, without knowing a password.
                  </p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">💾 Data Exposure</h4>
                  <p className="text-sm text-slate-300">
                    Operators like $regex can be used to extract data character-by-character (blind injection).
                  </p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📚 Widely Applicable</h4>
                  <p className="text-sm text-slate-300">
                    Any JSON/document API (MongoDB, CouchDB, Elasticsearch, LDAP directories) with weak input
                    validation is at risk, not just SQL-based apps.
                  </p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🙈 Easy to Miss</h4>
                  <p className="text-sm text-slate-300">
                    "We don't use SQL, so we're not vulnerable to injection" is a common and incorrect assumption.
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
                <h4 className="font-bold mb-3 text-green-400">Why Type Checking Works:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Reject Before It Reaches the Query:</strong> a dict is refused before it can ever be interpreted as a query operator</li>
                  <li>• <strong>Explicit Expected Type:</strong> the code states what it expects (a string) instead of trusting the caller</li>
                  <li>• <strong>Same Principle as SQL's Parameterized Queries:</strong> user input is always treated as a literal value, never as query logic</li>
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
                The mock account is <code className="bg-slate-800 px-2 py-1 rounded">admin</code> / <code className="bg-slate-800 px-2 py-1 rounded">secret123</code>.
                Try logging in with the real password, a wrong one, or a NoSQL operator payload as the "password" field below.
                This is a safe simulation - experiment freely!
              </p>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-3">Payloads to Try:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-400">✓ Safe Input:</p>
                    <button
                      onClick={() => setLabInput('secret123')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-green-300">secret123</code> - correct password
                    </button>
                    <button
                      onClick={() => setLabInput('wrongpassword')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-green-300">wrongpassword</code> - incorrect, safely rejected
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-red-400">⚠️ Operator Injection:</p>
                    <button
                      onClick={() => setLabInput('{"$ne": null}')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-red-300">{'{"$ne": null}'}</code> - bypass via not-equal
                    </button>
                    <button
                      onClick={() => setLabInput('{"$gt": ""}')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-red-300">{'{"$gt": ""}'}</code> - bypass via greater-than
                    </button>
                    <button
                      onClick={() => setLabInput('{"$regex": ".*"}')}
                      className="w-full text-left bg-slate-800 hover:bg-slate-750 px-3 py-2 rounded text-xs"
                    >
                      <code className="text-red-300">{'{"$regex": ".*"}'}</code> - bypass via regex
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Enter "password" value (or click examples above):</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder='Try: {"$ne": null}'
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleLabSubmit}
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Attempt Login
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
                      <strong>Simulated MongoDB Filter:</strong>
                    </p>
                    <code className="block bg-slate-900 p-3 rounded text-sm text-purple-300 overflow-x-auto">
                      {labResult.query}
                    </code>
                    <p className="text-sm mt-2">
                      <strong>Result:</strong>{' '}
                      <span className={labResult.authenticated ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {labResult.authenticated ? 'authenticated: true (logged in as admin)' : 'authenticated: false'}
                      </span>
                    </p>
                    {labResult.impact && (
                      <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded">
                        <p className="text-sm font-bold text-red-400">{labResult.impact}</p>
                      </div>
                    )}

                    {!labResult.safe && (
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/50 rounded">
                        <p className="text-sm text-blue-300">
                          <strong>What Happened:</strong> The "password" value was accepted as an object (a query
                          operator) instead of a plain string. The vulnerable endpoint never checked its type before
                          handing it to the database filter.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">✅ How Type Checking Prevents This:</h4>
                    <code className="block bg-slate-900 p-3 rounded text-sm text-green-300 mb-2">
                      isinstance(password, str)  # False for {'{"$ne": null}'} -&gt; request rejected with 400
                    </code>
                    <p className="text-sm text-slate-300">
                      With a type check in place, your input <code className="bg-slate-800 px-2 py-1 rounded">{labInput}</code> would
                      be rejected before it ever reaches the database, regardless of what operator it contains.{' '}
                      <strong className="text-green-400">Attack blocked!</strong>
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

export default NoSQLInjectionModule;
