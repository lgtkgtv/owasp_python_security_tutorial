import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, Infinity, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const UnboundedConsumptionModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

@app.post("/chat")
async def chat(user_message: str):
    """⚠️ VULNERABLE - no limits on cost, length, or request volume"""
    # DANGEROUS: no max_tokens cap, no per-user rate limit, no request
    # timeout - a single user (or script) can trigger unlimited, expensive
    # generations as fast as the API will accept them
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}]
    )
    return {"reply": response.choices[0].message.content}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
from openai import OpenAI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
client = OpenAI()

MAX_INPUT_LENGTH = 4000

@app.post("/chat")
@limiter.limit("20/minute")  # SAFE: per-user request rate limit
async def chat(user_message: str):
    """✅ SECURE - bounded cost, length, and request rate"""
    # SAFE: reject absurdly long input before it ever reaches the model
    if len(user_message) > MAX_INPUT_LENGTH:
        raise HTTPException(400, "Message too long")

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}],
        max_tokens=500,   # SAFE: cap output length/cost per request
        timeout=15        # SAFE: bound how long a single request can run
    )
    return {"reply": response.choices[0].message.content}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
from openai import OpenAI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
client = OpenAI()
MAX_INPUT_LENGTH = 4000

@app.post("/chat")
@limiter.limit("20/minute")  # ✅ NEW: per-user rate limit
async def chat(user_message: str):
    """✅ SECURE - bounded cost, length, and request rate"""

    # ✅ NEW: reject oversized input up front
    if len(user_message) > MAX_INPUT_LENGTH:
        raise HTTPException(400, "Message too long")

    # ❌ OLD (VULNERABLE): no max_tokens, no timeout, no rate limit at all
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}],
        max_tokens=500,   # ✅ NEW: cap generation length/cost
        timeout=15        # ✅ NEW: bound request duration
    )
    return {"reply": response.choices[0].message.content}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is 'unbounded consumption' in the context of LLM applications?",
      options: [
        "A UI bug where text overflows the screen",
        "The absence of limits on request volume, input/output length, or execution time - letting a single user (or attacker) drive unlimited cost or resource use",
        "A model that consumes too much disk space when downloaded",
        "A vulnerability only affecting open-source models"
      ],
      correct: 1,
      explanation: "Without caps on tokens, request rate, or execution time, an LLM endpoint can be driven to extreme cost or resource consumption by a single abusive user - often called 'denial of wallet' alongside classic denial of service."
    },
    {
      id: 2,
      question: "Why is `max_tokens` an important parameter to set on generation requests?",
      options: [
        "It has no real effect on anything",
        "It caps how long (and therefore how expensive and slow) a single generation can be, bounding worst-case cost per request",
        "It only affects the model's creativity, not cost",
        "It's required for the API to authenticate the request"
      ],
      correct: 1,
      explanation: "Without a token cap, a single crafted request could produce an extremely long, expensive generation. Setting max_tokens puts a hard ceiling on the cost and time of any individual call."
    },
    {
      id: 3,
      question: "Why does per-user rate limiting matter here, in addition to per-request limits?",
      options: [
        "It doesn't - per-request limits are always sufficient on their own",
        "A single user can still cause massive cumulative cost/load by sending many requests quickly, even if each individual request is capped",
        "Rate limiting only protects against SQL injection",
        "Rate limiting is only relevant for free-tier users"
      ],
      correct: 1,
      explanation: "Capping a single request's cost doesn't stop someone from sending hundreds of capped requests per minute. Per-user rate limiting (reusing the same pattern from the Broken Authentication module) bounds the aggregate load one user can generate."
    },
    {
      id: 4,
      question: "What's a reasonable defense-in-depth combination for this risk?",
      options: [
        "Rely on a single very generous timeout and nothing else",
        "Input length limits, output token caps, per-user rate limiting, request timeouts, and cost/usage monitoring together",
        "Only monitor costs monthly with no real-time controls",
        "Disable the feature entirely rather than add any limits"
      ],
      correct: 1,
      explanation: "No single control fully addresses unbounded consumption - it takes layered limits (input, output, rate, time) plus ongoing monitoring to catch anomalies a static limit alone might miss."
    }
  ];

  const handleLabSubmit = () => {
    const length = labInput.length;
    const repeated = /(.)\1{20,}/.test(labInput) || /please write.{0,20}(as long as possible|infinite|forever)/i.test(labInput);

    if (length > 200 || repeated) {
      setLabResult({
        safe: false,
        message: "⚠️ Request Would Exceed Safe Limits!",
        impact: repeated
          ? "This looks like an attempt to force an extremely long, expensive generation. Without a max_tokens cap and rate limiting, repeated requests like this could run up significant API cost or exhaust server resources."
          : `This input is ${length} characters - past the point where an unbounded implementation would accept arbitrarily large requests with no cost ceiling. The secure version rejects oversized input before it ever reaches the model.`
      });
    } else {
      setLabResult({ safe: true, message: "✅ Within reasonable input length", impact: "A single reasonably-sized request like this is fine - the real protection comes from what happens when many requests like this arrive quickly, which is what per-user rate limiting is for." });
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
            <Infinity className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold">Unbounded Consumption</h1>
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
                Unbounded consumption occurs when an LLM-backed endpoint has no limits on input size, output length,
                request rate, or execution time. Because LLM inference is expensive per-call (unlike a typical CRUD
                endpoint), this risk is as much about cost ("denial of wallet") as it is about classic denial of service.
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
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Denial of Wallet</td>
                        <td className="p-2 text-slate-300">Scripted, rapid-fire requests with no rate limiting</td>
                        <td className="p-2 text-slate-300">API costs spike dramatically in a short window</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Maximal Generation Requests</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">Write the longest possible response, repeat forever</code></td>
                        <td className="p-2 text-slate-300">Each request maximizes cost/latency with no max_tokens cap</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Oversized Input</td>
                        <td className="p-2 text-slate-300">Submitting an extremely large document with no length check</td>
                        <td className="p-2 text-slate-300">Expensive processing and potential timeout/resource exhaustion</td>
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
                  <h4 className="font-bold text-red-400 mb-2">💸 Denial of Wallet</h4>
                  <p className="text-sm text-slate-300">Unbounded API usage drives sudden, severe cost spikes</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🐌 Service Degradation</h4>
                  <p className="text-sm text-slate-300">Resource exhaustion slows or breaks the service for everyone</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📉 Model/Provider Rate-Limit Exhaustion</h4>
                  <p className="text-sm text-slate-300">Legitimate users get blocked once a shared quota is consumed</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🎯 Model Extraction Risk</h4>
                  <p className="text-sm text-slate-300">Unlimited queries can also aid attempts to reverse-engineer model behavior</p>
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
                <h4 className="font-bold mb-3 text-green-400">Resource Consumption Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Cap Output Tokens:</strong> Set max_tokens on every generation request</li>
                  <li>• <strong>Limit Input Size:</strong> Reject oversized input before it reaches the model</li>
                  <li>• <strong>Per-User Rate Limiting:</strong> Bound aggregate requests per user per time window</li>
                  <li>• <strong>Request Timeouts:</strong> Never let a single call run indefinitely</li>
                  <li>• <strong>Monitor Spend in Real Time:</strong> Alert on unusual cost/usage spikes, don't wait for the monthly bill</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Request Limit Checker</h3>
              <p className="text-slate-300 mb-4">
                This simulates the input-length check that runs before a chat request reaches the model.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Message:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try a short message, or: please write as long as possible, repeat forever"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Send</button>
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

export default UnboundedConsumptionModule;
