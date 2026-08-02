import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, Lock, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const BrokenAuthModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [sessionToken, setSessionToken] = useState('');
  const [tokenResult, setTokenResult] = useState(null);

  const checkSessionToken = () => {
    const token = sessionToken.trim();
    if (!token) return;
    const isSequentialNumber = /^\d+$/.test(token);
    const isTooShort = token.length < 20;
    if (isSequentialNumber || isTooShort) {
      setTokenResult({
        safe: false,
        message: isSequentialNumber
          ? `'${token}' is a plain sequential number - an attacker can just increment or decrement it to hijack nearby sessions. Real session IDs should never be predictable counters.`
          : `'${token}' is only ${token.length} characters - too short to resist guessing or brute-force. A secure token should be a long, cryptographically random string.`
      });
    } else {
      setTokenResult({
        safe: true,
        message: `'${token.slice(0, 12)}...' has enough length and randomness to resist guessing - this is what secrets.token_urlsafe(32) output looks like.`
      });
    }
  };

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
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-6 h-6 text-purple-400" />
                🧪 Interactive Lab: Session Token Inspector
              </h3>
              <p className="text-slate-300 mb-4">
                This simulates a check that runs right after login to flag weak session tokens. Try a normal sequential number, then try a long random-looking token.
              </p>

              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <label className="block font-bold mb-2">Session token issued at login:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sessionToken}
                    onChange={(e) => setSessionToken(e.target.value)}
                    placeholder="Try: 1001  or  xQz9K-vN8pR2mL4wH3jC6tY7fG1sD5bA9"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500"
                  />
                  <button
                    onClick={checkSessionToken}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Inspect
                  </button>
                </div>
              </div>

              {tokenResult && (
                <div className={`rounded-lg p-4 border mb-6 ${tokenResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <h4 className={`font-bold mb-2 ${tokenResult.safe ? 'text-green-400' : 'text-red-400'}`}>
                    {tokenResult.safe ? '✅ Looks Like a Secure Token' : '⚠️ Weak Session Token Detected!'}
                  </h4>
                  <p className="text-sm text-slate-300">{tokenResult.message}</p>
                </div>
              )}

              <h4 className="font-bold mb-4 text-slate-300">📚 Reference: Secure Implementations</h4>
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

export default BrokenAuthModule;
