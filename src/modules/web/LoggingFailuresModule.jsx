import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, ScrollText, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const LoggingFailuresModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import logging

app = FastAPI()
logger = logging.getLogger("app")

@app.post("/login")
async def login(username: str, password: str):
    """⚠️ VULNERABLE - no security logging, credential logged in the clear"""
    # DANGEROUS: logs the raw password for "debugging"
    logger.info(f"Login attempt: username={username} password={password}")

    if not authenticate(username, password):
        # DANGEROUS: failed attempts are never recorded anywhere
        return {"error": "Invalid credentials"}

    return {"message": "Logged in"}`;

  const secureCode = `from fastapi import FastAPI
import logging

app = FastAPI()
logger = logging.getLogger("security")

@app.post("/login")
async def login(username: str, password: str, request: Request):
    """✅ SECURE - logs the security event, never the secret itself"""
    success = authenticate(username, password)

    # ✅ SAFE: records who, what, when, and outcome - never the password
    logger.info(
        "login_attempt",
        extra={
            "username": username,
            "outcome": "success" if success else "failure",
            "source_ip": request.client.host,
        }
    )

    if not success:
        # ✅ SAFE: feeds a real-time alert after N failures for this account/IP
        check_failed_login_threshold(username, request.client.host)
        return {"error": "Invalid credentials"}

    return {"message": "Logged in"}`;

  const comparisonCode = `from fastapi import FastAPI
import logging

app = FastAPI()
logger = logging.getLogger("security")

@app.post("/login")
async def login(username: str, password: str, request: Request):
    """✅ SECURE - logs the security event, never the secret itself"""
    success = authenticate(username, password)

    # ❌ OLD (VULNERABLE): logs the raw password in plaintext
    # logger.info(f"Login attempt: username={username} password={password}")

    # ✅ NEW (SECURE): structured event, outcome recorded, no secret
    logger.info(
        "login_attempt",
        extra={
            "username": username,
            "outcome": "success" if success else "failure",
            "source_ip": request.client.host,
        }
    )

    # ❌ OLD (VULNERABLE): failed attempts vanish - nothing to alert on
    if not success:
        # ✅ NEW (SECURE): feeds a real-time alert after N failures
        check_failed_login_threshold(username, request.client.host)
        return {"error": "Invalid credentials"}

    return {"message": "Logged in"}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is the core problem with 'Security Logging & Monitoring Failures'?",
      options: [
        "Applications log too much information",
        "Security-relevant events (failed logins, permission denials, admin actions) go unrecorded or unmonitored, so breaches can go undetected for a long time",
        "Logs are always stored insecurely",
        "It only affects applications without a database"
      ],
      correct: 1,
      explanation: "This category covers the failure to record and actively monitor security-relevant events - without that trail, an attacker's activity (brute-forcing a login, probing for access) simply leaves no signal anyone will notice."
    },
    {
      id: 2,
      question: "Why is logging a raw password 'for debugging' a serious mistake?",
      options: [
        "It makes the logs too large",
        "It turns the log file itself into a plaintext credential store - anyone with log access, or an attacker who exfiltrates logs, now has the password",
        "It has no real downside",
        "It only matters for admin accounts"
      ],
      correct: 1,
      explanation: "Logs are often retained for months, shipped to third-party aggregators, and accessible to a wider set of people than the production database itself - so any secret written into them is exposed far more broadly than intended."
    },
    {
      id: 3,
      question: "What should a properly logged failed-login event include?",
      options: [
        "The user's plaintext password, for investigation purposes",
        "Who attempted it, the outcome, and enough context (like source IP and timestamp) to reconstruct the event - without the credential itself",
        "Nothing - failed logins shouldn't be logged at all",
        "Only the HTTP status code"
      ],
      correct: 1,
      explanation: "Enough metadata to detect patterns like brute-force or credential stuffing (who, when, from where, how many times) is what matters - the secret itself should never appear in the log."
    },
    {
      id: 4,
      question: "Logging alone (without monitoring) is usually not enough. Why?",
      options: [
        "Logging is always sufficient by itself",
        "If nothing actively reviews or alerts on the logged events, an attack can sit in the logs unnoticed for months - detection requires monitoring and alerting, not just log storage",
        "Monitoring makes logging unnecessary",
        "Logs expire before anyone can read them"
      ],
      correct: 1,
      explanation: "A log entry no one looks at doesn't stop a breach. Real detection requires active monitoring - dashboards, alert thresholds, and a response process - built on top of the underlying log data."
    }
  ];

  const handleLabSubmit = () => {
    const entry = labInput.trim();
    if (!entry) return;
    const lower = entry.toLowerCase();

    const leaksSecret = /password\s*=|passwd\s*=|secret\s*=|token\s*=|api[_-]?key\s*=|ssn\s*=/i.test(entry);
    const looksLikeAuthEvent = /login|auth|sign[- ]?in/i.test(lower);
    const hasFailureSignal = /fail|denied|invalid|unauthorized|401|403/i.test(lower);
    const hasContext = /(user(_id)?|username|ip)\s*=/i.test(lower);

    if (leaksSecret) {
      setLabResult({
        safe: false,
        message: '⚠️ Sensitive Data Logged!',
        impact: "This log line writes a raw credential or secret to disk. Anyone with log access - or an attacker who exfiltrates logs - now has it in plaintext. Log that authentication was attempted, never the credential itself."
      });
    } else if (looksLikeAuthEvent && hasFailureSignal && hasContext) {
      setLabResult({
        safe: true,
        message: '✅ Properly Logged Security Event',
        impact: "This captures that an authentication failure happened, along with who/what triggered it, without leaking the credential - exactly what's needed to detect brute-force or credential-stuffing later."
      });
    } else if (looksLikeAuthEvent) {
      setLabResult({
        safe: false,
        message: '⚠️ Insufficient Security Context',
        impact: "This mentions authentication but doesn't clearly record the outcome, actor, or source. During an incident, you won't be able to reconstruct who tried what, when, or how many times."
      });
    } else {
      setLabResult({
        safe: false,
        message: '⚠️ No Security Event Logged',
        impact: "This reads like a generic request log with no indication a security-relevant event (login, permission check, admin action) even happened. If this was a failed login, monitoring would never notice."
      });
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
            <ScrollText className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-bold">Security Logging &amp; Monitoring Failures</h1>
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
                This category covers two related failures: not logging security-relevant events at all (so an attack leaves no trace
                to detect), and logging the wrong things - like raw passwords or tokens - which turns the log file itself into a
                liability. Without reliable logs and someone or something watching them, a breach can run undetected for months.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Attack/Failure Examples - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Failure Type</th>
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Credential Leakage</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">password=hunter2</code> written to disk</td>
                        <td className="p-2 text-slate-300">Log access becomes equivalent to credential theft</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Silent Brute-Force</td>
                        <td className="p-2 text-slate-300">Failed logins are never recorded</td>
                        <td className="p-2 text-slate-300">Thousands of guesses leave zero evidence to alert on</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Missing Context</td>
                        <td className="p-2 text-slate-300">An event is logged, but without actor/IP/outcome</td>
                        <td className="p-2 text-slate-300">Impossible to reconstruct what actually happened during an incident</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Log Injection</td>
                        <td className="p-2 text-slate-300">Attacker input containing newlines forges fake log entries</td>
                        <td className="p-2 text-slate-300">Confuses or misleads whoever reviews the logs later</td>
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
                  <h4 className="font-bold text-red-400 mb-2">⏳ Extended Dwell Time</h4>
                  <p className="text-sm text-slate-300">Breaches regularly go undetected for weeks or months without monitoring</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🔓 Logs as a Target</h4>
                  <p className="text-sm text-slate-300">Secrets logged in plaintext make the log store itself worth stealing</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🧩 No Forensic Trail</h4>
                  <p className="text-sm text-slate-300">Incident response can't reconstruct what happened without adequate records</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">📋 Compliance Failure</h4>
                  <p className="text-sm text-slate-300">Many frameworks (SOC 2, PCI-DSS, HIPAA) mandate specific audit logging</p>
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
                <h4 className="font-bold mb-3 text-green-400">Logging &amp; Monitoring Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Log Security Events:</strong> Auth successes/failures, permission denials, admin actions</li>
                  <li>• <strong>Never Log Secrets:</strong> Passwords, tokens, and full card numbers must never appear in logs</li>
                  <li>• <strong>Include Context:</strong> Actor, outcome, source IP, and timestamp on every security event</li>
                  <li>• <strong>Alert on Thresholds:</strong> Trigger a real-time alert after repeated failures, not just a static log line</li>
                  <li>• <strong>Protect Log Integrity:</strong> Centralize logs somewhere an attacker who compromises the app can't tamper with them</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Log Entry Reviewer</h3>
              <p className="text-slate-300 mb-4">
                Paste a sample log line and this simulates a review for two things: does it leak sensitive data, and does it capture
                enough context to be useful during a security investigation?
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Log entry:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: login_attempt username=admin password=hunter2  or  login_failed user_id=42 reason=invalid_password ip=203.0.113.7"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Review</button>
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

export default LoggingFailuresModule;
