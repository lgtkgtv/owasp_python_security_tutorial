import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, EyeOff, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

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

export default SensitiveDataModule;
