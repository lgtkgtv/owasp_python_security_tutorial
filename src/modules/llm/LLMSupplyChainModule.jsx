import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, PackageSearch, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const LLMSupplyChainModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `# requirements.txt
# ⚠️ VULNERABLE - unpinned versions and an unverified model source
langchain
some-community-llm-wrapper
transformers

# app.py
from transformers import AutoModelForCausalLM

# DANGEROUS: pulling a fine-tuned model from an unverified source with
# no hash/signature check - the weights could be silently backdoored
model = AutoModelForCausalLM.from_pretrained("random-user/finance-assistant-v2")`;

  const secureCode = `# requirements.txt
# ✅ SECURE - every dependency pinned to an exact, reviewed version
langchain==0.3.7
transformers==4.46.2

# app.py
from transformers import AutoModelForCausalLM
import hashlib

TRUSTED_MODEL_SHA256 = "a1b2c3d4...verified-hash-on-record..."

def load_verified_model(model_path: str):
    """✅ SECURE - verify provenance before loading any model weights"""
    actual_hash = hashlib.sha256(open(model_path, "rb").read()).hexdigest()
    if actual_hash != TRUSTED_MODEL_SHA256:
        raise ValueError("Model file hash does not match the verified, expected checksum")
    return AutoModelForCausalLM.from_pretrained(model_path)

model = load_verified_model("./models/finance-assistant-v2-verified")`;

  const comparisonCode = `# requirements.txt
# ❌ OLD (VULNERABLE): langchain / transformers  (no version pins)
# ✅ NEW (SECURE): exact, reviewed versions
langchain==0.3.7
transformers==4.46.2

# app.py
import hashlib
TRUSTED_MODEL_SHA256 = "a1b2c3d4...verified-hash-on-record..."

def load_verified_model(model_path: str):
    # ❌ OLD (VULNERABLE): AutoModelForCausalLM.from_pretrained("random-user/model")
    # with no verification of what's actually being downloaded and executed

    # ✅ NEW (SECURE): hash-verify before ever loading the weights
    actual_hash = hashlib.sha256(open(model_path, "rb").read()).hexdigest()
    if actual_hash != TRUSTED_MODEL_SHA256:
        raise ValueError("Model file hash does not match the verified, expected checksum")
    return AutoModelForCausalLM.from_pretrained(model_path)`;

  const quizQuestions = [
    {
      id: 1,
      question: "How is LLM supply chain risk broader than traditional software dependency risk?",
      options: [
        "It isn't broader - it's exactly the same concern",
        "It includes everything traditional dependency risk does, plus model weights, fine-tunes, training datasets, and plugins/tools from unverified sources",
        "It only applies to open-source models",
        "It only matters for models larger than 1 billion parameters"
      ],
      correct: 1,
      explanation: "An LLM application's 'supply chain' includes its Python packages (like any app), but also the model weights themselves, any fine-tuning data used, and any third-party plugins or tools it's given access to - each is a potential injection point for a compromised artifact."
    },
    {
      id: 2,
      question: "Why is pinning exact dependency versions (e.g. `langchain==0.3.7` instead of `langchain`) important?",
      options: [
        "It makes the code run faster",
        "It prevents an automatic update from silently pulling in a compromised or behaviorally-changed release without review",
        "It's required by the Python language",
        "It only matters for production, never for development"
      ],
      correct: 1,
      explanation: "An unpinned dependency can be silently upgraded to a new version - including one that's been compromised - the next time you install. Pinning plus a lockfile means every install gets the exact, reviewed bytes you tested."
    },
    {
      id: 3,
      question: "Why verify a model file's hash/signature before loading it?",
      options: [
        "It's not necessary if the file came from a well-known hosting site",
        "Model weights can be tampered with or maliciously fine-tuned; a hash check confirms you're loading exactly the artifact you reviewed and trust, not a swapped-in one",
        "It makes model inference faster",
        "Only applies to models larger than a few GB"
      ],
      correct: 1,
      explanation: "Anyone can upload a model file that looks legitimate but has been altered - fine-tuned to leak data, behave maliciously under certain triggers, or otherwise deviate from what you tested. A hash/signature check is the model-weights equivalent of verifying a package checksum."
    },
    {
      id: 4,
      question: "What's a reasonable ongoing practice for managing LLM supply chain risk?",
      options: [
        "Install the newest version of every package automatically to stay current",
        "Maintain a reviewed, pinned dependency list; verify model/plugin provenance; and run dependency/SCA scanning (e.g. pip-audit) as part of CI",
        "Avoid using any third-party models or packages at all",
        "Only use models released in the last 30 days"
      ],
      correct: 1,
      explanation: "Treating model weights, fine-tunes, and plugins with the same scrutiny as code dependencies - pinned, reviewed, and scanned - closes most of the practical supply chain gap without requiring you to build everything from scratch."
    }
  ];

  const handleLabSubmit = () => {
    const lower = labInput.trim().toLowerCase();
    const unpinned = !/[=<>]=?\s*\d/.test(labInput) && lower.length > 0;
    const untrustedSource = lower.includes('random') || lower.includes('unverified') || lower.includes('anon');

    if (unpinned || untrustedSource) {
      setLabResult({
        safe: false,
        message: "⚠️ Supply Chain Risk Detected!",
        impact: unpinned
          ? "No version pin was found - the next install could silently pull in a different, potentially compromised release with no review step."
          : "This source looks unverified - loading model weights or packages from an unvetted publisher means you have no assurance about what's actually in the artifact you're running."
      });
    } else {
      setLabResult({ safe: true, message: "✅ Looks pinned and from a named, presumably vetted source", impact: "A specific version was declared. Remember this simulation only checks basic formatting - real supply chain security also requires hash verification and a documented review process for the source itself." });
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
            <PackageSearch className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl font-bold">Supply Chain</h1>
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
                LLM supply chain risk extends classic dependency risk (unpinned packages, outdated libraries) to
                cover model weights, fine-tunes, training data, and third-party plugins/tools - any of which can be
                swapped, tampered with, or maliciously crafted before it ever reaches your application.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Example:</h4>
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
                        <td className="p-2 font-semibold text-red-400">Unpinned Dependency</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">langchain</code> (no version)</td>
                        <td className="p-2 text-slate-300">Next install silently pulls a different, unreviewed release</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Unverified Model Source</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300">random-user/finance-assistant-v2</code></td>
                        <td className="p-2 text-slate-300">Loaded weights could be maliciously fine-tuned or backdoored</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Over-Permissioned Plugin</td>
                        <td className="p-2 text-slate-300">A third-party tool installed with full filesystem/network access</td>
                        <td className="p-2 text-slate-300">A single compromised plugin can act with the whole app's privileges</td>
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
                  <h4 className="font-bold text-red-400 mb-2">🎭 Backdoored Model Behavior</h4>
                  <p className="text-sm text-slate-300">A tampered fine-tune behaves maliciously under specific triggers</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">📦 Compromised Dependency Update</h4>
                  <p className="text-sm text-slate-300">An automatic upgrade introduces malicious code into your stack</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🔌 Plugin Over-Reach</h4>
                  <p className="text-sm text-slate-300">A single third-party tool acts with excessive privilege</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🕳️ Undetected Long-Term Compromise</h4>
                  <p className="text-sm text-slate-300">Subtle model tampering can go unnoticed far longer than a code bug</p>
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
                <h4 className="font-bold mb-3 text-green-400">Supply Chain Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Pin Every Dependency:</strong> Exact versions, committed lockfile, reviewed upgrades</li>
                  <li>• <strong>Verify Model Provenance:</strong> Hash/signature-check any model weights before loading</li>
                  <li>• <strong>Vet Fine-Tune Sources:</strong> Know exactly what data and process produced any custom model</li>
                  <li>• <strong>Scan Continuously:</strong> Run SCA tooling (e.g. `pip-audit`) in CI, not just once at setup</li>
                  <li>• <strong>Least-Privilege Plugins:</strong> Grant third-party tools only the specific access they need</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Dependency/Model Reference Checker</h3>
              <p className="text-slate-300 mb-4">
                Paste a requirements.txt-style line or a model reference, and this simulates a basic supply-chain review.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Package or model reference:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: langchain==0.3.7  or  random-user/finance-assistant-v2"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Check</button>
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

export default LLMSupplyChainModule;
