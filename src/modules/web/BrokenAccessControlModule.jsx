import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Fingerprint, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const BrokenAccessControlModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: int, current_user: dict = Depends(get_current_user)):
    """⚠️ VULNERABLE - trusts the ID with no ownership check"""
    # DANGEROUS: fetches whatever invoice_id was requested, regardless
    # of whether current_user actually owns it
    invoice = db.get_invoice(invoice_id)
    return invoice`;

  const secureCode = `from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: int, current_user: dict = Depends(get_current_user)):
    """✅ SECURE - enforces object-level authorization"""
    invoice = db.get_invoice(invoice_id)

    if invoice is None:
        raise HTTPException(404, "Invoice not found")

    # ✅ SAFE: verify the requester actually owns this record
    if invoice.owner_id != current_user["id"]:
        raise HTTPException(403, "Not authorized to view this invoice")

    return invoice`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: int, current_user: dict = Depends(get_current_user)):
    """✅ SECURE - enforces object-level authorization"""
    invoice = db.get_invoice(invoice_id)

    if invoice is None:
        raise HTTPException(404, "Invoice not found")

    # ❌ OLD (VULNERABLE): no ownership check at all
    # return invoice

    # ✅ NEW (SECURE): confirm ownership before returning anything
    if invoice.owner_id != current_user["id"]:
        raise HTTPException(403, "Not authorized to view this invoice")

    return invoice`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is an IDOR (Insecure Direct Object Reference) vulnerability?",
      options: [
        "A vulnerability in how objects are serialized",
        "When an application exposes a reference to an internal object (like an ID) and fails to verify the requester is authorized to access that specific object",
        "A type of SQL injection",
        "A vulnerability that only affects file uploads"
      ],
      correct: 1,
      explanation: "IDOR happens when an app trusts a user-supplied identifier (an invoice ID, a user ID in a URL) and returns or modifies whatever record matches it, without checking the requester actually owns or is permitted to see that record."
    },
    {
      id: 2,
      question: "Why is Broken Access Control ranked #1 in the OWASP Top 10 (2021)?",
      options: [
        "It's the newest category",
        "It was found in the vast majority of tested applications and often leads directly to full data exposure or account takeover",
        "It only affects legacy applications",
        "It's the easiest vulnerability to fix"
      ],
      correct: 1,
      explanation: "OWASP's 2021 data showed broken access control present in an overwhelming majority of applications tested, making it the most prevalent and often most impactful category."
    },
    {
      id: 3,
      question: "What's the core fix for an IDOR vulnerability?",
      options: [
        "Encrypt the ID in the URL",
        "Enforce an object-level authorization check on every request - confirm the authenticated user is allowed to access that specific record",
        "Make IDs longer and harder to guess",
        "Rate limit the endpoint"
      ],
      correct: 1,
      explanation: "Obfuscating or lengthening IDs (security through obscurity) doesn't fix the underlying problem. The record must always be checked against who is asking for it, every single request."
    },
    {
      id: 4,
      question: "Besides reading another user's data, what else can IDOR enable?",
      options: [
        "Only read access - IDOR can never modify data",
        "Writing, updating, or deleting another user's records if the same missing check applies to POST/PUT/DELETE endpoints",
        "Only affects admin accounts",
        "Nothing beyond viewing"
      ],
      correct: 1,
      explanation: "The same class of bug on a PUT or DELETE endpoint lets an attacker modify or destroy another user's data, not just view it - the fix is identical: verify ownership before acting."
    }
  ];

  const OWNED_INVOICES = [1001, 1002, 1003];

  const handleLabSubmit = () => {
    const raw = labInput.trim();
    const num = parseInt(raw, 10);
    if (!raw || isNaN(num)) return;

    if (OWNED_INVOICES.includes(num)) {
      setLabResult({
        safe: true,
        message: '✅ Access Allowed - This Is Your Invoice',
        impact: `Invoice #${num} belongs to your account (user_id=101), so returning it is correct behavior.`,
        leak: null
      });
    } else {
      setLabResult({
        safe: false,
        message: "⚠️ IDOR - Accessed Another User's Invoice!",
        impact: `Invoice #${num} belongs to a different account. In the vulnerable version, the endpoint trusts the ID in the URL and returns it anyway - there's no check that you actually own it.`,
        leak: `{"invoice_id": ${num}, "customer_name": "Jordan Alvarez", "amount": "$4,812.00", "billing_address": "1420 Cedar Ave, Unit 6"}`
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
            <Fingerprint className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl font-bold">Broken Access Control (IDOR)</h1>
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
                Broken access control happens when an application exposes a direct reference to an internal object - an invoice ID,
                an order number, a user ID in a URL - and fails to verify that the authenticated user is actually authorized to access
                that specific record. Anyone who can guess or enumerate IDs can pull up other people's data.
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
                        <td className="p-2 font-semibold text-red-400">ID Enumeration</td>
                        <td className="p-2 text-slate-300">Increment <code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">/invoices/1001</code>, 1002, 1003...</td>
                        <td className="p-2 text-slate-300">Reads every customer's invoice, one request at a time</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Parameter Tampering</td>
                        <td className="p-2 text-slate-300">Change <code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">user_id</code> in a request body from your own ID to another user's</td>
                        <td className="p-2 text-slate-300">Views or edits another account's profile/settings</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Function-Level Bypass</td>
                        <td className="p-2 text-slate-300">Call an admin-only endpoint directly, skipping the hidden UI link</td>
                        <td className="p-2 text-slate-300">Regular users reach admin functionality the UI never exposed to them</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Method Swap</td>
                        <td className="p-2 text-slate-300">Same URL that's read-only via GET accepts DELETE or PUT with no extra check</td>
                        <td className="p-2 text-slate-300">Turns a read-only IDOR into data tampering or deletion</td>
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
                  <h4 className="font-bold text-red-400 mb-2">📄 Mass Data Exposure</h4>
                  <p className="text-sm text-slate-300">A single script enumerating IDs can dump every user's records</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">✍️ Unauthorized Modification</h4>
                  <p className="text-sm text-slate-300">The same missing check on write endpoints enables tampering, not just reading</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🕵️ Privilege Escalation</h4>
                  <p className="text-sm text-slate-300">Function-level bypass lets regular users reach admin-only actions</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">⚖️ Regulatory Exposure</h4>
                  <p className="text-sm text-slate-300">Cross-tenant data leaks are a direct breach of privacy regulations like GDPR/HIPAA</p>
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
                <h4 className="font-bold mb-3 text-green-400">Access Control Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Check Ownership Every Time:</strong> Verify the authenticated user owns/is permitted to access the specific record, on every request</li>
                  <li>• <strong>Deny by Default:</strong> Access should require an explicit permission grant, not just the absence of a block</li>
                  <li>• <strong>Enforce Server-Side:</strong> Never rely on hiding a link or button in the UI as the only protection</li>
                  <li>• <strong>Apply to All Methods:</strong> The same check must cover GET, POST, PUT, and DELETE on a resource</li>
                  <li>• <strong>Centralize the Logic:</strong> Use a shared authorization dependency/middleware instead of re-implementing checks per-route</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Invoice Viewer</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /invoices/&#123;invoice_id&#125;</code> for a logged-in
                user (user_id=101) who owns invoices 1001-1003. Try one of your own invoice numbers, then try a number that belongs to
                someone else.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">invoice_id:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: 1002 (yours)  or  2001 (someone else's)"
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

export default BrokenAccessControlModule;
