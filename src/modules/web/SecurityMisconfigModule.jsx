import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, Settings, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

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

export default SecurityMisconfigModule;
