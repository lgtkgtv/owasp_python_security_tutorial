import React, { useState } from 'react';
import { AlertCircle, BookOpen, Boxes, CheckCircle, Code, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const VulnerableComponentsModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `# requirements.txt
# ⚠️ VULNERABLE - old versions with known CVEs, some unpinned entirely
PyYAML==5.3.1
requests
Pillow==8.2.0`;

  const secureCode = `# requirements.txt
# ✅ SECURE - exact versions pinned, all patched against known CVEs
PyYAML==6.0.1
requests==2.31.0
Pillow==10.2.0

# ✅ SECURE - run in CI on every build
# pip-audit                 (scans installed packages against the PyPA advisory DB)
# pip install --require-hashes -r requirements.txt   (verifies package integrity)
# Dependabot / Renovate     (opens a PR automatically when a patched version ships)`;

  const comparisonCode = `# requirements.txt
# ✅ SECURE - exact versions pinned, all patched against known CVEs

# ❌ OLD (VULNERABLE): PyYAML==5.3.1 - CVE-2020-14343, arbitrary code
# execution via yaml.load() on untrusted input
# ✅ NEW (SECURE):
PyYAML==6.0.1

# ❌ OLD (VULNERABLE): requests (unpinned) - could resolve to any version,
# including 2.19.0 which leaks Authorization headers across redirects
# ✅ NEW (SECURE):
requests==2.31.0

# ❌ OLD (VULNERABLE): Pillow==8.2.0 - several image-parsing buffer
# overflow CVEs fixed only in later releases
# ✅ NEW (SECURE):
Pillow==10.2.0`;

  const quizQuestions = [
    {
      id: 1,
      question: "What's the risk of leaving a dependency unpinned (no version specified)?",
      options: [
        "It always installs the fastest version",
        "Every fresh install can silently resolve to a different, potentially vulnerable or even compromised release with no review step",
        "Unpinned dependencies are always more secure",
        "It has no practical effect"
      ],
      correct: 1,
      explanation: "Without a pinned version, `pip install` (or equivalent) can pull whatever the latest release happens to be at install time - including a version with a newly discovered CVE, or in a supply-chain attack, a maliciously altered release."
    },
    {
      id: 2,
      question: "Why isn't 'we pinned a version once' enough on its own?",
      options: [
        "Pinning is unnecessary",
        "Pinned versions still age - a version that was safe a year ago may have a disclosed CVE today, so dependencies need ongoing scanning and updates",
        "Pinned versions update themselves automatically",
        "It is enough, no further action needed"
      ],
      correct: 1,
      explanation: "Pinning stops accidental upgrades, but it freezes you on a version whose vulnerability status can change the moment a new CVE is disclosed against it - hence tools like pip-audit and Dependabot that continuously check pinned versions against advisory databases."
    },
    {
      id: 3,
      question: "What does a tool like pip-audit or Dependabot actually do?",
      options: [
        "Automatically writes your application code",
        "Checks your installed/declared dependency versions against a known-vulnerability database and flags or opens a PR for matches",
        "Encrypts your dependencies",
        "Replaces the need for a requirements file entirely"
      ],
      correct: 1,
      explanation: "These tools compare what you actually depend on against public vulnerability databases (like the PyPA advisory database or GitHub's advisory database), surfacing matches so a human can review and upgrade."
    },
    {
      id: 4,
      question: "Besides direct dependencies, what else contributes to this risk category?",
      options: [
        "Nothing else matters",
        "Transitive dependencies (packages your dependencies depend on) and abandoned/unmaintained packages that will never receive a security patch",
        "Only dependencies written in Python",
        "Only dependencies published in the last week"
      ],
      correct: 1,
      explanation: "A vulnerable package several layers deep in your dependency tree is just as exploitable as one you imported directly - and a package with no maintainer will never get a fix, no matter how severe a future disclosure is."
    }
  ];

  const VULNERABLE_PACKAGES = {
    pyyaml: { maxSafe: '5.4', note: "versions before 5.4 allow arbitrary code execution via yaml.load() on untrusted input (CVE-2020-14343)" },
    requests: { maxSafe: '2.20.0', note: "versions before 2.20.0 leak Authorization headers across domains when following a redirect (CVE-2018-18074)" },
    django: { maxSafe: '3.2.18', note: "several disclosed CVEs are only patched in 3.2.18 and later" },
    pillow: { maxSafe: '9.0.0', note: "versions before 9.0.0 are affected by multiple image-parsing buffer overflow CVEs" }
  };

  const handleLabSubmit = () => {
    const raw = labInput.trim();
    if (!raw) return;

    const match = raw.match(/^([A-Za-z0-9_.\-]+)\s*(?:==\s*([\d.]+))?$/);
    if (!match) {
      setLabResult({ safe: false, message: "Couldn't parse that", impact: "Try a format like 'pyyaml==5.3.1' or just 'requests' for an unpinned entry.", leak: null });
      return;
    }
    const [, name, version] = match;
    const known = VULNERABLE_PACKAGES[name.toLowerCase()];

    if (!version) {
      setLabResult({
        safe: false,
        message: `⚠️ Unpinned Dependency: ${name}`,
        impact: "No version is pinned, so every install can silently pull in a newer - or compromised - release with no review step. Pin an exact version and update it deliberately.",
        leak: null
      });
    } else if (known && version.localeCompare(known.maxSafe, undefined, { numeric: true }) < 0) {
      setLabResult({
        safe: false,
        message: `⚠️ Known-Vulnerable Version: ${name}==${version}`,
        impact: `${known.note}. Upgrade to ${known.maxSafe} or later.`,
        leak: null
      });
    } else if (known) {
      setLabResult({
        safe: true,
        message: `✅ Patched Version: ${name}==${version}`,
        impact: `This is at or above the fixed version (${known.maxSafe}) for the known CVEs tracked against ${name}.`,
        leak: null
      });
    } else {
      setLabResult({
        safe: true,
        message: `✅ No Known Issues In This Sample: ${name}==${version}`,
        impact: "Nothing in this simulation's small CVE sample flags this package/version. In a real pipeline this would still run through a full scanner like pip-audit or Safety against the complete advisory database.",
        leak: null
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
            <Boxes className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl font-bold">Vulnerable &amp; Outdated Components</h1>
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
                Every dependency you install runs with the same privileges as your own code. If it's an old version with a disclosed
                CVE, unpinned so it can silently change, or simply abandoned by its maintainer, an attacker doesn't need to find a bug
                in your code at all - the ready-made exploit already exists in public advisory databases.
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
                        <th className="text-left p-2 text-purple-400">Risk Type</th>
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Known-CVE Version</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">pyyaml==5.3.1</code></td>
                        <td className="p-2 text-slate-300">Arbitrary code execution via unsafe deserialization</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Unpinned Dependency</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">requests</code> (no version)</td>
                        <td className="p-2 text-slate-300">Next install can silently resolve to any release, patched or not</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Transitive Dependency</td>
                        <td className="p-2 text-slate-300">A vulnerable package several layers deep in the dependency tree</td>
                        <td className="p-2 text-slate-300">Exploitable even though you never imported it directly</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Abandoned Package</td>
                        <td className="p-2 text-slate-300">No maintainer activity in years, no security releases planned</td>
                        <td className="p-2 text-slate-300">A future disclosed CVE will simply never be patched upstream</td>
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
                  <h4 className="font-bold text-red-400 mb-2">💥 Off-the-Shelf Exploits</h4>
                  <p className="text-sm text-slate-300">Public CVE write-ups mean attackers don't need to research anything</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🔗 Supply Chain Risk</h4>
                  <p className="text-sm text-slate-300">An unpinned install can pull a compromised release with no warning</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🕸️ Hidden Blast Radius</h4>
                  <p className="text-sm text-slate-300">Transitive dependencies multiply exposure well beyond what's in your requirements file</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🕰️ Compounding Debt</h4>
                  <p className="text-sm text-slate-300">The longer an upgrade is deferred, the larger and riskier the eventual jump becomes</p>
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
                <h4 className="font-bold mb-3 text-green-400">Dependency Hygiene Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Pin Exact Versions:</strong> Avoid wildcard/unbounded version ranges in production</li>
                  <li>• <strong>Scan Continuously:</strong> Run pip-audit/Safety in CI, not just once at project start</li>
                  <li>• <strong>Automate Update PRs:</strong> Use Dependabot or Renovate to surface patched versions quickly</li>
                  <li>• <strong>Track Transitive Dependencies:</strong> A full dependency tree scan, not just top-level packages</li>
                  <li>• <strong>Retire Abandoned Packages:</strong> Replace dependencies with no maintenance activity before they become unfixable</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Dependency Version Checker</h3>
              <p className="text-slate-300 mb-4">
                Paste a requirements.txt-style line and this simulates checking it against a small known-CVE sample. Try a pinned
                vulnerable version, an unpinned package, and a patched version.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Package or version line:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: pyyaml==5.3.1  or  requests  (unpinned)  or  pyyaml==6.0.1"
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

export default VulnerableComponentsModule;
