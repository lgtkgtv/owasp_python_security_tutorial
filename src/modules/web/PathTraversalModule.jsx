import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, FolderOpen, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const PathTraversalModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const mockFiles = {
    'report.pdf': 'Q1 Financial Report (this is the intended, allowed file)',
    'photo.jpg': '[binary JPEG data - vacation-photo.jpg]',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin',
    '/etc/shadow': 'root:$6$rZ9x...redacted...:19723:0:99999:7:::',
    'config/secrets.env': 'DATABASE_PASSWORD=Sup3rSecret!\nAPI_KEY=sk_live_51H8x7f...\nJWT_SECRET=e3b0c44298fc1c149afbf4c8996fb'
  };

  const vulnerableCode = `from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()

@app.get("/files/download")
async def download_file(filename: str):
    """⚠️ VULNERABLE - No path validation"""
    # DANGEROUS: user input is concatenated directly onto the
    # base directory, so "../" sequences can escape it entirely
    file_path = f"/var/app/uploads/{filename}"
    return FileResponse(file_path)`;

  const secureCode = `from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()
UPLOAD_DIR = Path("/var/app/uploads").resolve()

@app.get("/files/download")
async def download_file(filename: str):
    """✅ SECURE - Resolves and validates the final path"""
    # SAFE: reject path separators and traversal sequences outright
    if "/" in filename or "\\\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    # SAFE: resolve the real path, then confirm it's still inside
    # UPLOAD_DIR - this catches encoded/symlink tricks too
    requested_path = (UPLOAD_DIR / filename).resolve()
    if not requested_path.is_relative_to(UPLOAD_DIR):
        raise HTTPException(403, "Access denied")

    if not requested_path.is_file():
        raise HTTPException(404, "File not found")

    return FileResponse(requested_path)`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()
UPLOAD_DIR = Path("/var/app/uploads").resolve()

@app.get("/files/download")
async def download_file(filename: str):
    """✅ SECURE - Resolves and validates the final path"""

    # ❌ OLD (VULNERABLE): raw concatenation, no validation
    # file_path = f"/var/app/uploads/{filename}"

    # ✅ NEW (SECURE): reject obvious traversal characters early
    if "/" in filename or "\\\\" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")

    # ✅ NEW (SECURE): resolve and confirm the path stays inside UPLOAD_DIR
    requested_path = (UPLOAD_DIR / filename).resolve()
    if not requested_path.is_relative_to(UPLOAD_DIR):
        raise HTTPException(403, "Access denied")

    return FileResponse(requested_path)`;

  const quizQuestions = [
    {
      id: 1,
      question: "What allows path traversal attacks to succeed?",
      options: [
        "Weak database passwords",
        "Combining user input into file paths without validating or normalizing them",
        "Using HTTP instead of HTTPS",
        "Storing files in the cloud"
      ],
      correct: 1,
      explanation: "When a filename comes straight from the user and gets concatenated into a file path, sequences like '../' let the attacker step outside the intended directory."
    },
    {
      id: 2,
      question: "Why does resolving the path and checking it's still inside the base directory matter, rather than just blocking '..'?",
      options: [
        "It's faster than string matching",
        "It catches traversal attempts regardless of encoding, symlinks, or creative representations that string filters might miss",
        "It automatically compresses the file",
        "It isn't actually necessary if you check for '..'"
      ],
      correct: 1,
      explanation: "Attackers have many ways to represent '..' (URL encoding, double encoding, absolute paths, symlinks). Resolving the real path and confirming it's still a child of the base directory is robust to all of them."
    },
    {
      id: 3,
      question: "Which of these is a path traversal payload?",
      options: [
        "report.pdf",
        "../../../../etc/passwd",
        "photo.jpg",
        "invoice_2024.csv"
      ],
      correct: 1,
      explanation: "'../../../../etc/passwd' walks up out of the intended uploads directory to read a sensitive system file."
    },
    {
      id: 4,
      question: "Beyond reading files, what else can path traversal enable when combined with a file upload or write feature?",
      options: [
        "Nothing further - it's read-only by nature",
        "Remote code execution, by overwriting an executable file, config, or web-accessible script",
        "Automatic patching of the vulnerability",
        "Faster file downloads"
      ],
      correct: 1,
      explanation: "If an application also writes files based on user-controlled paths, traversal can let an attacker overwrite startup scripts, configs, or drop a web shell, escalating to full remote code execution."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput.trim();
    let result = { safe: false };

    const looksLikeTraversal = input.includes('..') || input.startsWith('/') || input.toLowerCase().includes('etc');

    if (looksLikeTraversal) {
      let resolved = null;
      if (input.includes('shadow')) resolved = '/etc/shadow';
      else if (input.includes('passwd')) resolved = '/etc/passwd';
      else if (input.toLowerCase().includes('secret') || input.toLowerCase().includes('config')) resolved = 'config/secrets.env';
      else resolved = '/etc/passwd';

      result.message = `⚠️ Path Traversal Detected - Resolved to: ${resolved}`;
      result.content = mockFiles[resolved];
      result.impact = "🔓 CRITICAL: The '..' sequences walked out of /var/app/uploads and reached a file well outside the intended directory. In a real deployment this could expose credentials, system accounts, or source code.";
    } else if (mockFiles[input]) {
      result.safe = true;
      result.message = "✅ Normal file served successfully";
      result.content = mockFiles[input];
    } else {
      result.safe = true;
      result.message = "❌ File not found in uploads directory";
      result.content = null;
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
            <FolderOpen className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Path Traversal</h1>
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
                Path traversal occurs when user-supplied input is used to build a file path without validating that it stays within the
                intended directory. Sequences like "../" let an attacker walk up the directory tree and reach files far outside what the
                application meant to expose.
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
                        <td className="p-2 font-semibold text-red-400">Basic Traversal</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">../../../../etc/passwd</code></td>
                        <td className="p-2 text-slate-300">Reads system account list</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Sensitive Config</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">../config/secrets.env</code></td>
                        <td className="p-2 text-slate-300">Leaks database passwords and API keys</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">URL-Encoded Traversal</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">%2e%2e%2f%2e%2e%2fetc%2fpasswd</code></td>
                        <td className="p-2 text-slate-300">Bypasses filters that only match literal ".."</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Absolute Path</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">/etc/shadow</code></td>
                        <td className="p-2 text-slate-300">Some implementations pass absolute paths straight through</td>
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
                  <h4 className="font-bold text-red-400 mb-2">🔑 Credential Theft</h4>
                  <p className="text-sm text-slate-300">Config and secrets files reveal database passwords, API keys</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🗂️ System File Disclosure</h4>
                  <p className="text-sm text-slate-300">/etc/passwd, registry hives, and other OS-level files exposed</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📄 Source Code Exposure</h4>
                  <p className="text-sm text-slate-300">Application logic and other vulnerabilities become visible</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">When combined with file write/upload, can lead to full compromise</p>
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
                <h4 className="font-bold mb-3 text-green-400">Path Traversal Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Resolve and Verify:</strong> Use Path.resolve() then confirm the result is inside the base directory</li>
                  <li>• <strong>Reject Separators:</strong> Disallow "/", "\\", and ".." in user-supplied filenames outright</li>
                  <li>• <strong>Use an Index, Not a Filename:</strong> Map user input to an internal ID/lookup table instead of a raw path</li>
                  <li>• <strong>Least Privilege:</strong> Run the process with a user that can't read sensitive files even if traversal occurs</li>
                  <li>• <strong>Chroot / Sandboxing:</strong> Constrain the filesystem the application process can see at all</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: File Download Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">GET /files/download?filename=...</code> against an
                uploads directory containing report.pdf and photo.jpg. Try a normal filename, then try walking outside the directory.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">filename:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: report.pdf or ../../../../etc/passwd"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Download</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  {labResult.impact && <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>}
                  {labResult.content && (
                    <pre className="bg-slate-950 rounded p-3 mt-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">{labResult.content}</pre>
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

export default PathTraversalModule;
