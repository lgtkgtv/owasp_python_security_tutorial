import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, RefreshCw, Shield, Terminal, Trophy, X } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

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

export default CSRFModule;
