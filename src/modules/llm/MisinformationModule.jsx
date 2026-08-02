import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, Megaphone, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const MisinformationModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

@app.get("/ask-health-question")
async def ask_health_question(question: str):
    """⚠️ VULNERABLE - presents an unverified, ungrounded answer as fact"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": question}]
    )
    # DANGEROUS: no sources, no confidence signal, no disclaimer, no
    # human review - just a confident-sounding answer presented as truth
    return {"answer": response.choices[0].message.content}`;

  const secureCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

@app.get("/ask-health-question")
async def ask_health_question(question: str):
    """✅ SECURE - grounded in retrieved sources, clearly labeled, human-reviewable"""
    # SAFE: retrieve actual reference material first (RAG), don't rely on
    # the model's unverified internal "knowledge" alone
    sources = retrieve_verified_medical_sources(question)

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Answer using ONLY the sources below. Cite each claim. Sources: {sources}\\n\\nQuestion: {question}"
        }]
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": sources,
        "disclaimer": "AI-generated summary of the cited sources. Not a substitute for professional medical advice - verify independently."
    }`;

  const comparisonCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

@app.get("/ask-health-question")
async def ask_health_question(question: str):
    """✅ SECURE - grounded in retrieved sources, clearly labeled, human-reviewable"""

    # ✅ NEW: ground the answer in actual retrieved reference material
    sources = retrieve_verified_medical_sources(question)

    # ❌ OLD (VULNERABLE): messages=[{"role": "user", "content": question}]
    # with nothing but the model's own unverified internal "knowledge"

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Answer using ONLY these sources: {sources}\\n\\nQuestion: {question}"}]
    )

    # ✅ NEW: sources and an explicit disclaimer are returned alongside the answer
    return {
        "answer": response.choices[0].message.content,
        "sources": sources,
        "disclaimer": "AI-generated summary - not a substitute for professional advice."
    }`;

  const quizQuestions = [
    {
      id: 1,
      question: "What does 'grounding' a model's answer mean, and why does it matter for misinformation?",
      options: [
        "Making the model respond more slowly for accuracy",
        "Basing the answer on retrieved, verifiable reference material rather than the model's unverified internal knowledge alone - it makes claims traceable to a source",
        "Restricting the model to only answer in one language",
        "Running the model on more powerful hardware"
      ],
      correct: 1,
      explanation: "An ungrounded answer is only as reliable as the model's training data and internal 'beliefs,' which can include confidently-stated hallucinations. Grounding in retrieved sources lets both the system and the user verify a claim against something concrete."
    },
    {
      id: 2,
      question: "Why is a confident-sounding answer particularly risky in high-stakes domains like health, legal, or financial advice?",
      options: [
        "Confidence in tone has no bearing on accuracy, so it's not actually a risk",
        "Users tend to trust confident-sounding responses, and an LLM's fluent tone doesn't correlate with factual accuracy - a hallucinated answer can sound just as authoritative as a correct one",
        "It's only risky if the response is unusually long",
        "This only applies to responses written in technical jargon"
      ],
      correct: 1,
      explanation: "LLMs generate fluent, confident-sounding text regardless of whether the underlying claim is accurate. In domains where a wrong answer has real consequences, that mismatch between tone and reliability is exactly where harm happens."
    },
    {
      id: 3,
      question: "What role should human review play in an AI system that gives health/legal/financial guidance?",
      options: [
        "None - a well-grounded system doesn't need human review",
        "High-stakes domains should keep a human in the loop, especially for decisions with real consequences - the AI assists, it doesn't replace professional judgment",
        "Human review should only happen after something goes wrong",
        "Human review is only needed for free-tier users"
      ],
      correct: 1,
      explanation: "Even a well-grounded, well-cited system can still be wrong or miss context a professional would catch. In domains like healthcare, keeping a human reviewer in the loop is a core safety practice, not an optional nicety."
    },
    {
      id: 4,
      question: "Why is showing a clear 'AI-generated, verify independently' disclaimer valuable, even alongside grounding and citations?",
      options: [
        "It has no real value beyond legal cover",
        "It calibrates user trust appropriately, reminding them that even a sourced, well-formed answer should be verified for consequential decisions",
        "It's required by every country's law",
        "It makes the response load faster"
      ],
      correct: 1,
      explanation: "Grounding and citations reduce the *rate* of hallucination, but don't eliminate it. A clear disclaimer helps set the right expectation with the user regardless of how good the underlying system is."
    }
  ];

  const handleLabSubmit = () => {
    const lower = labInput.toLowerCase();
    const highStakes = ['medication', 'dosage', 'diagnos', 'legal advice', 'invest', 'should i take', 'is it safe to'].some(m => lower.includes(m));

    if (highStakes) {
      setLabResult({
        safe: false,
        message: "⚠️ High-Stakes Question - Grounding & Disclaimer Required",
        impact: "A question like this touches health/legal/financial decisions with real consequences if the answer is wrong. The vulnerable version would return a confident-sounding answer with no sources, no disclaimer, and no human review path. The secure version retrieves verified sources, cites them, and clearly labels the answer as AI-generated."
      });
    } else {
      setLabResult({ safe: true, message: "✅ Lower-stakes question", impact: "Even for lower-stakes questions, grounding and clear AI-generated labeling remain good practice - the risk is simply more acute for questions with real-world consequences if wrong." });
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
            <Megaphone className="w-10 h-10 text-stone-400" />
            <h1 className="text-4xl font-bold">Misinformation</h1>
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
                LLMs generate fluent, confident-sounding text regardless of whether the underlying claim is accurate -
                a phenomenon often called "hallucination." Misinformation risk is what happens when an application
                presents that output as verified fact, with no grounding, sourcing, or human review, especially in
                domains like health, legal, or financial guidance where being wrong has real consequences.
              </p>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">❌ Vulnerable Code Example:</h4>
                <PythonCode code={vulnerableCode} />
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <h4 className="font-bold mb-3">Risk Scenarios - Try These in the Lab:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-2 text-purple-400">Scenario</th>
                        <th className="text-left p-2 text-purple-400">Example</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Confident Hallucination</td>
                        <td className="p-2 text-slate-300">Model states a fabricated drug interaction as established fact</td>
                        <td className="p-2 text-slate-300">User makes a health decision based on false information</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Overreliance</td>
                        <td className="p-2 text-slate-300">A team stops independently verifying AI-generated legal/financial summaries</td>
                        <td className="p-2 text-slate-300">Systemic errors go unnoticed until real damage occurs</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Fabricated Citations</td>
                        <td className="p-2 text-slate-300">Model invents a plausible-looking but nonexistent source</td>
                        <td className="p-2 text-slate-300">False sense of verification when the "citation" isn't real</td>
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
                  <h4 className="font-bold text-red-400 mb-2">🏥 Health Decision Harm</h4>
                  <p className="text-sm text-slate-300">Fabricated medical claims lead to unsafe self-treatment decisions</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">⚖️ Legal/Financial Missteps</h4>
                  <p className="text-sm text-slate-300">Confidently wrong guidance leads to real financial or legal harm</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📉 Overreliance / Skill Atrophy</h4>
                  <p className="text-sm text-slate-300">Teams stop double-checking, letting errors compound silently</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">⚖️ Liability Exposure</h4>
                  <p className="text-sm text-slate-300">Presenting unverified AI output as advice carries real legal risk</p>
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
              <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-200"><strong>💡 This connects directly to responsible AI use in healthcare:</strong> assistive, human-in-the-loop design - grounding, citations, and clear disclaimers, with a clinician making the final call - is exactly the right posture for AI-assisted health tools, not autonomous diagnosis.</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-bold mb-3 text-green-400">Misinformation Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Ground Answers in Retrieved Sources:</strong> Don't rely on the model's unverified internal knowledge alone</li>
                  <li>• <strong>Cite Sources Explicitly:</strong> Let users trace a claim back to something verifiable</li>
                  <li>• <strong>Label AI-Generated Content Clearly:</strong> Set accurate user expectations every time</li>
                  <li>• <strong>Human-in-the-Loop for High Stakes:</strong> Health, legal, and financial guidance need a professional in the loop</li>
                  <li>• <strong>Measure Hallucination Rate:</strong> Track and improve accuracy over time, don't assume it's solved</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Risk Classifier</h3>
              <p className="text-slate-300 mb-4">
                This simulates classifying whether a question needs grounding, citations, and a disclaimer before being answered.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Question:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: What's a good recipe for pasta?  or  Is it safe to take ibuprofen with this medication?"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Classify</button>
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

export default MisinformationModule;
