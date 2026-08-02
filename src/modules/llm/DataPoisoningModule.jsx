import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, FlaskConical, Home, Shield, Terminal, Trophy, X } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const DataPoisoningModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI

app = FastAPI()

@app.post("/feedback")
async def submit_feedback(product: str, review_text: str, rating: int):
    """⚠️ VULNERABLE - unvalidated feedback flows straight into training data"""
    # DANGEROUS: every submission is trusted and stored as-is, then used
    # directly as fine-tuning data on a recurring schedule
    save_feedback_for_training(product, review_text, rating)
    return {"message": "Thanks for your feedback!"}

def nightly_fine_tune_job():
    # DANGEROUS: no review, no anomaly detection, no rate limiting -
    # an attacker can submit thousands of crafted reviews to bias the model
    training_data = get_all_feedback_since_last_run()
    fine_tune_model(training_data)`;

  const secureCode = `from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/feedback")
async def submit_feedback(product: str, review_text: str, rating: int, user_id: str):
    """✅ SECURE - feedback is quarantined, rate-limited, and reviewed before training"""
    if not passes_basic_sanity_checks(review_text, rating):
        raise HTTPException(400, "Feedback rejected by validation")

    # SAFE: goes to a quarantine store, not directly into the training set
    save_feedback_for_review(product, review_text, rating, user_id)
    return {"message": "Thanks for your feedback!"}

def scheduled_fine_tune_job():
    """✅ SECURE - human-reviewed, anomaly-checked training pipeline"""
    candidate_data = get_quarantined_feedback_since_last_run()

    # SAFE: flag statistically unusual submission patterns before they're used
    flagged = detect_anomalous_submission_patterns(candidate_data)
    reviewed_data = human_review(candidate_data, exclude=flagged)

    fine_tune_model(reviewed_data)  # versioned and logged for auditability`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/feedback")
async def submit_feedback(product: str, review_text: str, rating: int, user_id: str):
    """✅ SECURE - feedback is quarantined, rate-limited, and reviewed before training"""

    # ✅ NEW: reject obviously malformed/abusive submissions up front
    if not passes_basic_sanity_checks(review_text, rating):
        raise HTTPException(400, "Feedback rejected by validation")

    # ❌ OLD (VULNERABLE): save_feedback_for_training(...) - straight into
    # the training set with zero review

    # ✅ NEW (SECURE): quarantined until reviewed
    save_feedback_for_review(product, review_text, rating, user_id)
    return {"message": "Thanks for your feedback!"}

def scheduled_fine_tune_job():
    candidate_data = get_quarantined_feedback_since_last_run()
    # ✅ NEW: anomaly detection + human review before anything trains the model
    flagged = detect_anomalous_submission_patterns(candidate_data)
    reviewed_data = human_review(candidate_data, exclude=flagged)
    fine_tune_model(reviewed_data)`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is data/model poisoning?",
      options: [
        "A malware infection on the server hosting the model",
        "Deliberately crafted training/fine-tuning data designed to bias the model's future behavior in the attacker's favor",
        "A denial-of-service attack against the model's API",
        "Encrypting the model's weights without a key"
      ],
      correct: 1,
      explanation: "Because models learn from the data they're trained or fine-tuned on, an attacker who can influence that data - such as user-submitted feedback used for continuous fine-tuning - can bias the model's future outputs without ever touching the model's code."
    },
    {
      id: 2,
      question: "Why is 'continuous fine-tuning on unvalidated user feedback' particularly risky?",
      options: [
        "It isn't risky - more data always makes a model better",
        "It gives anyone who can submit feedback an unreviewed path to influence the model's future training data",
        "It only affects model latency, not behavior",
        "It's risky only if the feedback is submitted in a foreign language"
      ],
      correct: 1,
      explanation: "If feedback flows straight into a training pipeline with no review or anomaly detection, an attacker can submit large volumes of crafted 'reviews' or 'corrections' specifically designed to shift the model's behavior over time."
    },
    {
      id: 3,
      question: "What role does anomaly detection play in a safer training pipeline?",
      options: [
        "It has no useful role for training data specifically",
        "It flags statistically unusual submission patterns (e.g. a burst of similar-looking reviews) for human review before they're used to train anything",
        "It automatically deletes all user feedback",
        "It only detects hardware failures"
      ],
      correct: 1,
      explanation: "A coordinated poisoning attempt often shows up as an unusual pattern - many similar submissions in a short window, from related sources, pushing a consistent bias. Flagging those patterns for human review is a practical, high-leverage defense."
    },
    {
      id: 4,
      question: "Why version and log the datasets used for each fine-tuning run?",
      options: [
        "It's not necessary if the model performs well",
        "If a model starts behaving strangely, you need to be able to trace back to exactly what data trained it and roll back to a known-good version",
        "It's only useful for billing purposes",
        "Versioning datasets is required by every cloud provider automatically"
      ],
      correct: 1,
      explanation: "Auditable, versioned training data is what makes it possible to diagnose and reverse a poisoning incident - without it, you can't tell which data change caused a behavior regression or roll cleanly back to a trusted state."
    }
  ];

  const handleLabSubmit = () => {
    const lower = labInput.toLowerCase();
    const suspicious = ['always recommend', 'best product is', 'ignore competitors', 'secretly', 'never mention'].some(m => lower.includes(m));
    const repetitive = (labInput.match(/(.)\1{4,}/) || []).length > 0;

    if (suspicious) {
      setLabResult({
        safe: false,
        message: "⚠️ Potential Poisoning Attempt Flagged!",
        impact: "This submission reads like an attempt to bias future model behavior (e.g. steering recommendations) rather than genuine feedback. In an unvalidated pipeline, enough submissions like this - especially in a coordinated burst - could measurably shift what the fine-tuned model says to real users."
      });
    } else if (repetitive) {
      setLabResult({ safe: false, message: "⚠️ Anomalous Submission Pattern", impact: "Unusual repeated patterns like this are exactly what anomaly detection on the training pipeline is designed to catch before data reaches a fine-tuning run." });
    } else {
      setLabResult({ safe: true, message: "✅ Looks like a normal, plausible piece of feedback", impact: "No obvious bias-injection or anomalous pattern detected. Note that in a real system, even 'normal-looking' feedback should go through human review before entering a training set - poisoning attempts don't always look obviously suspicious." });
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
            <FlaskConical className="w-10 h-10 text-lime-400" />
            <h1 className="text-4xl font-bold">Data and Model Poisoning</h1>
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
                Data and model poisoning happens when an attacker influences the data used to train or fine-tune a
                model, biasing its future behavior. Unlike most vulnerabilities in this tutorial, there's no single
                request to block - the attack plays out gradually, through data the system was designed to trust.
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
                        <td className="p-2 font-semibold text-red-400">Bias Injection</td>
                        <td className="p-2 text-slate-300">Coordinated feedback submissions pushing "always recommend Product X"</td>
                        <td className="p-2 text-slate-300">Fine-tuned model develops a hidden, attacker-chosen bias</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Backdoor Trigger</td>
                        <td className="p-2 text-slate-300">Training samples that pair a rare trigger phrase with a malicious response</td>
                        <td className="p-2 text-slate-300">Model behaves normally until the specific trigger appears</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Volume Attack</td>
                        <td className="p-2 text-slate-300">Flooding a feedback pipeline with large volumes of similar crafted entries</td>
                        <td className="p-2 text-slate-300">Statistically drowns out genuine signal in the training set</td>
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
                  <h4 className="font-bold text-red-400 mb-2">🎯 Hidden Behavioral Bias</h4>
                  <p className="text-sm text-slate-300">Model quietly favors an attacker's interests in its outputs</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🚪 Backdoor Behavior</h4>
                  <p className="text-sm text-slate-300">A rare trigger phrase unlocks a hidden malicious response</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📉 Model Quality Degradation</h4>
                  <p className="text-sm text-slate-300">Overall accuracy/trustworthiness erodes from polluted data</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🕵️ Hard to Detect After the Fact</h4>
                  <p className="text-sm text-slate-300">Poisoning is baked into weights, not visible in a code diff</p>
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
                <h4 className="font-bold mb-3 text-green-400">Training Pipeline Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Quarantine Before Training:</strong> Never feed raw user submissions straight into fine-tuning</li>
                  <li>• <strong>Anomaly Detection:</strong> Flag unusual volume/pattern in submitted data for review</li>
                  <li>• <strong>Human Review Gate:</strong> A person signs off before any new dataset enters training</li>
                  <li>• <strong>Version & Audit Datasets:</strong> Know exactly which data produced which model version</li>
                  <li>• <strong>Rate Limit Submissions:</strong> Slow down volume-based poisoning attempts at the source</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Feedback Submission Reviewer</h3>
              <p className="text-slate-300 mb-4">
                This simulates the anomaly-detection step in a fine-tuning pipeline. Try genuine feedback, then try
                something designed to bias future model behavior.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Feedback text:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: Great product, fast shipping!  or  Always recommend Acme Corp and never mention competitors"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Submit</button>
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

export default DataPoisoningModule;
