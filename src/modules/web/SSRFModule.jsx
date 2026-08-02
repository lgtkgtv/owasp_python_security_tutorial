import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Globe, Home, Network, Shield, Terminal, Trophy, X } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const SSRFModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """⚠️ VULNERABLE - Fetches any URL the client supplies"""
    # DANGEROUS: no validation of scheme or host - the server will
    # happily make a request to internal infrastructure on request
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
import httpx
import ipaddress
import socket
from urllib.parse import urlparse

app = FastAPI()
ALLOWED_HOSTS = {"images.example-cdn.com", "media.partner-service.com"}

def is_public_ip(host: str) -> bool:
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(host))
        return not (ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved)
    except (socket.gaierror, ValueError):
        return False

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """✅ SECURE - Allowlists hosts and blocks internal/private IPs"""
    parsed = urlparse(url)

    # SAFE: only https, and only known, trusted hostnames
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise HTTPException(400, "URL host is not allowed")

    # SAFE: defense-in-depth - reject anything resolving to a
    # private/internal/loopback/cloud-metadata address
    if not is_public_ip(parsed.hostname):
        raise HTTPException(400, "URL resolves to a disallowed address")

    async with httpx.AsyncClient(follow_redirects=False) as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
import httpx
from urllib.parse import urlparse

app = FastAPI()
ALLOWED_HOSTS = {"images.example-cdn.com", "media.partner-service.com"}

@app.get("/fetch-preview")
async def fetch_preview(url: str):
    """✅ SECURE - Allowlists hosts and blocks internal/private IPs"""
    parsed = urlparse(url)

    # ❌ OLD (VULNERABLE): any url, any scheme, any host, no checks
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)

    # ✅ NEW (SECURE): only https + an explicit allowlist of hosts
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise HTTPException(400, "URL host is not allowed")

    # ✅ NEW (SECURE): resolve and re-check the actual IP, not just the string
    if not is_public_ip(parsed.hostname):
        raise HTTPException(400, "URL resolves to a disallowed address")

    async with httpx.AsyncClient(follow_redirects=False) as client:
        response = await client.get(url, timeout=5)
    return {"content": response.text[:500]}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is SSRF?",
      options: [
        "A client-side scripting attack",
        "A vulnerability where an attacker tricks the server into making requests to unintended destinations, often internal-only resources",
        "A type of SQL injection",
        "An attack that only affects file uploads"
      ],
      correct: 1,
      explanation: "SSRF abuses server-side code that fetches a URL on the caller's behalf, redirecting that request toward internal services, cloud metadata endpoints, or other unintended targets."
    },
    {
      id: 2,
      question: "Why is the cloud metadata endpoint (169.254.169.254) a common SSRF target?",
      options: [
        "It's the fastest server to respond",
        "It often exposes temporary cloud credentials to anything on the instance, without authentication",
        "It's the only internal service that exists",
        "It requires a password that's easy to guess"
      ],
      correct: 1,
      explanation: "Cloud providers expose an instance metadata service that, by design, answers unauthenticated requests from the instance itself - including temporary IAM credentials attached to that instance's role."
    },
    {
      id: 3,
      question: "Why is an allowlist of destinations generally better than a denylist of 'bad' hosts?",
      options: [
        "Allowlists are easier to bypass",
        "Denylists are easy to bypass via redirects, DNS rebinding, or alternate IP representations; allowlists only permit known-safe destinations",
        "There's no meaningful difference",
        "Denylists perform better under load"
      ],
      correct: 1,
      explanation: "It's much harder to enumerate every way an attacker might represent 'localhost' or an internal IP than to simply define the small set of destinations the feature actually needs to reach."
    },
    {
      id: 4,
      question: "What additional check helps even after validating the URL string itself?",
      options: [
        "Checking the URL's length",
        "Resolving the hostname and confirming the actual IP isn't private/internal (defense against DNS-based bypasses)",
        "Converting the URL to lowercase",
        "Adding a random query parameter"
      ],
      correct: 1,
      explanation: "A hostname can look legitimate in the string but resolve (or later re-resolve, via DNS rebinding) to a private or loopback address. Checking the resolved IP closes that gap."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput.trim();
    const lower = input.toLowerCase();
    const internalPatterns = ['localhost', '127.0.0.1', '169.254.169.254', '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.31.', 'internal', 'file://', 'gopher://'];
    const isInternal = internalPatterns.some(p => lower.includes(p));

    if (isInternal) {
      let leak = '[simulated] connection reached an internal-only service';
      if (lower.includes('169.254.169.254')) {
        leak = '{"AccessKeyId":"ASIA...redacted","SecretAccessKey":"wJalrXUt...redacted","Token":"IQoJb3Jp...redacted"}';
      } else if (lower.includes('6379') || lower.includes('redis')) {
        leak = '# Redis INFO\nredis_version:7.2.4\nrole:master\nconnected_clients:12';
      } else if (lower.includes('admin')) {
        leak = '<html><body><h1>Internal Admin Panel</h1><p>User management, feature flags, and deploy controls</p></body></html>';
      }
      setLabResult({
        safe: false,
        message: "⚠️ SSRF - Internal Resource Reached!",
        impact: "The server made this request on your behalf using its own network position - reaching a destination that isn't exposed to the public internet at all.",
        leak
      });
    } else if (lower.startsWith('https://') && (lower.includes('example-cdn.com') || lower.includes('partner-service.com'))) {
      setLabResult({ safe: true, message: "✅ Allowed Host - Preview Fetched", impact: "This host is on the explicit allowlist and resolves to a public address, so the request proceeds normally.", leak: null });
    } else {
      setLabResult({ safe: true, message: "❌ Blocked - Host Not on Allowlist", impact: "Even though this isn't an internal address, it still isn't one of the explicitly permitted hosts, so a secure implementation would reject it by default.", leak: null });
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
            <Globe className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold">Server-Side Request Forgery (SSRF)</h1>
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
                SSRF occurs when an application fetches a URL supplied (directly or indirectly) by the user without restricting where
                that request can go. Because the request originates from the server itself, it can reach internal services, cloud
                metadata endpoints, and other destinations that are never meant to be internet-facing.
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
                        <th className="text-left p-2 text-purple-400">Malicious URL</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Internal Service Access</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">http://127.0.0.1:6379/</code></td>
                        <td className="p-2 text-slate-300">Reaches an internal Redis instance not exposed publicly</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Cloud Metadata Theft</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">http://169.254.169.254/latest/meta-data/iam/...</code></td>
                        <td className="p-2 text-slate-300">Steals temporary cloud IAM credentials</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Internal Port Scanning</td>
                        <td className="p-2 text-slate-300">Repeated requests to http://10.0.0.X:PORT, timing responses</td>
                        <td className="p-2 text-slate-300">Maps internal hosts/ports from outside the network</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">DNS Rebinding Bypass</td>
                        <td className="p-2 text-slate-300">URL resolves to a public IP at check-time, then to an internal one at fetch-time</td>
                        <td className="p-2 text-slate-300">Bypasses a naive one-time allowlist check</td>
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
                  <h4 className="font-bold text-red-400 mb-2">🔑 Cloud Credential Theft</h4>
                  <p className="text-sm text-slate-300">Instance metadata endpoints leak temporary IAM credentials</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🕵️ Internal Reconnaissance</h4>
                  <p className="text-sm text-slate-300">Maps out and probes hosts on the internal network</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🛠️ Internal Admin Access</h4>
                  <p className="text-sm text-slate-300">Reaches admin panels/databases never meant to be public</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🧱 Firewall Bypass</h4>
                  <p className="text-sm text-slate-300">The server itself becomes the attacker's proxy past network defenses</p>
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
                <h4 className="font-bold mb-3 text-green-400">SSRF Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Allowlist Destinations:</strong> Only permit requests to specific, known-safe hosts</li>
                  <li>• <strong>Validate the Resolved IP:</strong> Reject private, loopback, link-local, and reserved ranges</li>
                  <li>• <strong>Disable Redirects (or Re-Validate After Them):</strong> Prevent allowlist bypass via redirect chains</li>
                  <li>• <strong>Restrict Schemes:</strong> Only allow https - block file://, gopher://, and similar</li>
                  <li>• <strong>Network Segmentation:</strong> Ensure internal services still require their own authentication as defense-in-depth</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: URL Preview Fetcher</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /fetch-preview?url=...</code> with no destination
                validation. Try a normal external URL, then try pointing it at an internal address.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">url:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: https://images.example-cdn.com/photo.jpg or http://169.254.169.254/latest/meta-data/iam/security-credentials/"
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

export default SSRFModule;
