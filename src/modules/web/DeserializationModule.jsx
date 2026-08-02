import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, PackageX, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const DeserializationModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI, Request
import pickle
import base64

app = FastAPI()

@app.post("/cart/restore")
async def restore_cart(request: Request):
    """⚠️ VULNERABLE - Deserializes untrusted pickle data"""
    body = await request.body()
    # DANGEROUS: pickle.loads executes arbitrary code embedded in the
    # byte stream via __reduce__ during deserialization - this is not
    # "parsing", it's running attacker-supplied instructions
    cart_data = pickle.loads(base64.b64decode(body))
    return {"cart": cart_data}`;

  const secureCode = `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: list[CartItem]

@app.post("/cart/restore")
async def restore_cart(cart: Cart):
    """✅ SECURE - Uses JSON + schema validation, never pickle"""
    # SAFE: JSON has no ability to encode executable behavior, and
    # Pydantic validates the shape/types before the data is ever used
    return {"cart": cart.dict()}`;

  const comparisonCode = `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: list[CartItem]

@app.post("/cart/restore")
async def restore_cart(cart: Cart):
    """✅ SECURE - Uses JSON + schema validation, never pickle"""

    # ❌ OLD (VULNERABLE): pickle.loads() can execute arbitrary code
    # body = await request.body()
    # cart_data = pickle.loads(base64.b64decode(body))

    # ✅ NEW (SECURE): plain data validated against an explicit schema
    return {"cart": cart.dict()}`;

  const quizQuestions = [
    {
      id: 1,
      question: "Why is Python's `pickle` module dangerous when loading untrusted input?",
      options: [
        "It's slower than JSON",
        "Loading a pickle can execute arbitrary code via special methods like __reduce__, not just restore data",
        "It only works with numbers",
        "It requires a special license for production use"
      ],
      correct: 1,
      explanation: "Pickle's format can embed instructions for reconstructing arbitrary Python objects, including ones that run code as a side effect of being 'unpickled' - deserializing untrusted pickle data is effectively running untrusted code."
    },
    {
      id: 2,
      question: "What's the recommended alternative for interchanging data with clients?",
      options: [
        "A custom binary format",
        "Plain data formats like JSON validated against an explicit schema (e.g., Pydantic models)",
        "Python's marshal module",
        "Storing everything in cookies instead"
      ],
      correct: 1,
      explanation: "JSON (or similar plain formats) has no mechanism to encode executable behavior. Combined with schema validation, it ensures the data has exactly the shape and types the application expects."
    },
    {
      id: 3,
      question: "Is YAML's `yaml.load()` safe to use on untrusted input by default?",
      options: [
        "Yes, YAML is always safe",
        "No - use yaml.safe_load(), which restricts what object types can be constructed",
        "Only if the file extension is .yml",
        "Yes, as long as the file is small"
      ],
      correct: 1,
      explanation: "The default PyYAML loader can construct arbitrary Python objects via tags like !!python/object/apply, similarly to pickle. safe_load() restricts construction to basic, safe types."
    },
    {
      id: 4,
      question: "Beyond remote code execution, what else can insecure deserialization enable?",
      options: [
        "Nothing else - it's purely a code execution issue",
        "Object/property injection, allowing privilege escalation or business logic bypass (e.g., flipping an is_admin field)",
        "Faster page loads",
        "Automatic session renewal"
      ],
      correct: 1,
      explanation: "Even without achieving code execution, a deserialized object's fields can sometimes be manipulated directly - for example, restoring a user object with a tampered role or permission flag."
    }
  ];

  const handleLabSubmit = () => {
    const suspiciousMarkers = ['__reduce__', 'os.system', 'subprocess', 'eval(', '__import__', 'os.popen'];
    const found = suspiciousMarkers.filter(m => labInput.includes(m));

    if (found.length > 0) {
      setLabResult({
        safe: false,
        message: "🚨 Malicious Payload Detected!",
        impact: `pickle.loads() doesn't just read data - it executes the reconstruction instructions embedded in the payload. The marker(s) ${found.join(', ')} indicate this payload would trigger code execution the instant it's deserialized, before your application logic even runs.`
      });
    } else {
      try {
        const parsed = JSON.parse(labInput);
        setLabResult({
          safe: true,
          message: "✅ Valid JSON Cart Restored",
          impact: `Parsed safely: ${JSON.stringify(parsed)}. JSON has no way to embed executable behavior, so this is inert no matter what a malicious user submits.`
        });
      } catch {
        setLabResult({
          safe: true,
          message: "❌ Not valid JSON",
          impact: "This input isn't valid JSON and would simply be rejected by schema validation - no code runs either way."
        });
      }
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
            <PackageX className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold">Insecure Deserialization</h1>
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
                Insecure deserialization occurs when an application reconstructs objects from untrusted data using formats that can
                embed executable behavior - most notably Python's pickle. Deserializing such data isn't just parsing; it's running
                instructions the attacker controls.
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
                        <td className="p-2 font-semibold text-red-400">Pickle RCE Payload</td>
                        <td className="p-2 text-slate-300">Crafted object whose __reduce__ returns (os.system, (cmd,))</td>
                        <td className="p-2 text-slate-300">Executes an arbitrary shell command the instant pickle.loads() runs</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Unsafe YAML Load</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">yaml.load()</code> with a python/object/apply tag</td>
                        <td className="p-2 text-slate-300">Same RCE outcome via YAML's Python object tags</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Gadget Chains</td>
                        <td className="p-2 text-slate-300">Chaining legitimate classes together during reconstruction</td>
                        <td className="p-2 text-slate-300">Achieves code execution even without an obvious "eval"</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Object Property Injection</td>
                        <td className="p-2 text-slate-300">Serialized object with a flipped is_admin field</td>
                        <td className="p-2 text-slate-300">Privilege escalation without any code execution needed</td>
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
                  <h4 className="font-bold text-red-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">Deserializing a payload can run arbitrary code immediately</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">👑 Privilege Escalation</h4>
                  <p className="text-sm text-slate-300">Tampered object fields grant admin rights without a password</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🐢 Denial of Service</h4>
                  <p className="text-sm text-slate-300">Crafted objects trigger huge resource consumption on load</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🖥️ Full System Compromise</h4>
                  <p className="text-sm text-slate-300">RCE on a backend service often means total server takeover</p>
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
                <h4 className="font-bold mb-3 text-green-400">Deserialization Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Never Unpickle Untrusted Data:</strong> Treat pickle as a code execution format, not a data format</li>
                  <li>• <strong>Use JSON + Schema Validation:</strong> Pydantic (or similar) enforces types and shape before use</li>
                  <li>• <strong>yaml.safe_load(), Not yaml.load():</strong> Restrict YAML to plain data types</li>
                  <li>• <strong>Sign or Encrypt if You Must Serialize State:</strong> Detect tampering before deserializing anything custom</li>
                  <li>• <strong>Keep Dependencies Updated:</strong> Known gadget chains are patched in libraries over time</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Cart Restore Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">POST /cart/restore</code>. Try a normal JSON cart, then
                try a payload containing pickle-style markers like <code className="bg-slate-900 px-2 py-1 rounded">__reduce__</code> or{' '}
                <code className="bg-slate-900 px-2 py-1 rounded">os.system</code>.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">request body:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder={'Try: {"items":[{"product_id":1,"quantity":2}]}  or  __reduce__ os.system(rm -rf /)'}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Restore Cart</button>
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

export default DeserializationModule;
