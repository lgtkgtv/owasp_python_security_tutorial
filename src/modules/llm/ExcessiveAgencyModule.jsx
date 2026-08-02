import React, { useState } from 'react';
import { AlertCircle, BookOpen, Bot, CheckCircle, Code, Home, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const ExcessiveAgencyModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()

# DANGEROUS: the agent can call any of these tools with no confirmation,
# no scoping, and no distinction between reversible and irreversible actions
TOOLS = ["read_file", "delete_file", "send_email", "transfer_funds"]

@app.post("/agent")
async def run_agent(user_request: str):
    """⚠️ VULNERABLE - full tool access, fully autonomous execution"""
    plan = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_request}],
        tools=[{"type": "function", "function": {"name": t}} for t in TOOLS]
    )
    # DANGEROUS: whatever the model decided to do, just do it - no
    # human ever sees the plan before it executes
    return execute_tool_calls(plan)`;

  const secureCode = `from fastapi import FastAPI, HTTPException
from openai import OpenAI

app = FastAPI()
client = OpenAI()

READ_ONLY_TOOLS = ["read_file"]
HIGH_IMPACT_TOOLS = ["delete_file", "send_email", "transfer_funds"]

@app.post("/agent")
async def run_agent(user_request: str, session_scope: list[str]):
    """✅ SECURE - least privilege, and a human checkpoint for irreversible actions"""
    # SAFE: only grant the tools this specific session actually needs
    allowed_tools = [t for t in READ_ONLY_TOOLS + HIGH_IMPACT_TOOLS if t in session_scope]

    plan = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_request}],
        tools=[{"type": "function", "function": {"name": t}} for t in allowed_tools]
    )

    for call in plan.tool_calls:
        if call.name in HIGH_IMPACT_TOOLS:
            # SAFE: irreversible/high-impact actions require explicit human confirmation
            queue_for_human_approval(call)
        else:
            execute_tool_call(call)

    return {"status": "plan submitted - high-impact actions await approval"}`;

  const comparisonCode = `from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()
client = OpenAI()
READ_ONLY_TOOLS = ["read_file"]
HIGH_IMPACT_TOOLS = ["delete_file", "send_email", "transfer_funds"]

@app.post("/agent")
async def run_agent(user_request: str, session_scope: list[str]):
    """✅ SECURE - least privilege, and a human checkpoint for irreversible actions"""

    # ✅ NEW: only grant tools this session was explicitly scoped to use
    allowed_tools = [t for t in READ_ONLY_TOOLS + HIGH_IMPACT_TOOLS if t in session_scope]

    plan = client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": user_request}],
        tools=[{"type": "function", "function": {"name": t}} for t in allowed_tools]
    )

    for call in plan.tool_calls:
        # ❌ OLD (VULNERABLE): execute_tool_calls(plan) - runs everything
        # the model decided on, with no human ever seeing the plan first

        # ✅ NEW (SECURE): irreversible actions pause for human sign-off
        if call.name in HIGH_IMPACT_TOOLS:
            queue_for_human_approval(call)
        else:
            execute_tool_call(call)`;

  const quizQuestions = [
    {
      id: 1,
      question: "What is 'excessive agency' in the context of LLM applications?",
      options: [
        "A model that refuses to answer questions",
        "An AI agent granted more autonomy, tool access, or permission than the specific task actually requires",
        "A model that runs too slowly",
        "A model trained on too much data"
      ],
      correct: 1,
      explanation: "Excessive agency is about the gap between what an agent is capable of doing (based on the tools/permissions it's been given) and what it actually needs for the task at hand. That gap is what an attacker - often via prompt injection - exploits."
    },
    {
      id: 2,
      question: "Why is 'auto-execute every tool call the model decides on' risky?",
      options: [
        "It isn't risky if the model is well-trained",
        "A manipulated plan (e.g. via prompt injection) executes immediately with no human ever reviewing it first",
        "It only matters for read-only tools",
        "It's risky only when the agent is slow"
      ],
      correct: 1,
      explanation: "If an attacker can influence what plan the model produces - through a crafted user request or poisoned content the agent reads - full auto-execution turns that influence directly into real-world action with no checkpoint."
    },
    {
      id: 3,
      question: "What's the distinction the secure example draws between tool types?",
      options: [
        "Fast tools vs. slow tools",
        "Read-only/reversible tools vs. high-impact/irreversible tools - only the latter require human confirmation before executing",
        "Free tools vs. paid tools",
        "Tools written in Python vs. tools written in JavaScript"
      ],
      correct: 1,
      explanation: "Not every action needs the same level of caution. Reading a file is low-risk and reversible; deleting a file or transferring funds is high-impact and often irreversible - the latter category is exactly where a human checkpoint matters most."
    },
    {
      id: 4,
      question: "What does 'least privilege' mean when applied to an AI agent's tool access?",
      options: [
        "Giving the agent every tool it might conceivably ever need, just in case",
        "Scoping the tools available to a given session/request to only what that specific task requires - nothing more",
        "Only allowing the agent to run once per day",
        "Never giving an agent any tools at all"
      ],
      correct: 1,
      explanation: "The same principle from classic access control applies to agents: the smaller the set of things an agent *can* do, the smaller the damage if it's ever manipulated into doing something it shouldn't."
    }
  ];

  const handleLabSubmit = () => {
    const lower = labInput.toLowerCase();
    const highImpact = ['delete', 'transfer', 'send money', 'wire', 'remove all', 'drop'].some(m => lower.includes(m));

    if (highImpact) {
      setLabResult({
        safe: false,
        message: "⚠️ High-Impact Action Requested - Human Approval Required",
        impact: "This request maps to an irreversible or high-impact tool (delete/transfer/similar). In the vulnerable version of this agent, this would execute immediately with no review. The secure version queues it for a human to approve before anything actually happens."
      });
    } else {
      setLabResult({ safe: true, message: "✅ Read-only / low-impact action - executes normally", impact: "This maps to a reversible, low-risk tool, so it's safe to run without a human checkpoint. The key design decision is which actions get this fast path and which don't." });
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
            <Bot className="w-10 h-10 text-violet-400" />
            <h1 className="text-4xl font-bold">Excessive Agency</h1>
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
                Excessive agency occurs when an AI agent is given more autonomy, tool access, or permission than a
                task actually requires. Combined with prompt injection - which can manipulate what plan the model
                produces - unchecked agency turns a text-generation bug into a real-world action.
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
                        <td className="p-2 font-semibold text-red-400">Injection-Driven Deletion</td>
                        <td className="p-2 text-slate-300">A document the agent reads contains "delete all files in /backups"</td>
                        <td className="p-2 text-slate-300">Irreversible data loss with no human ever approving it</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Unauthorized Fund Transfer</td>
                        <td className="p-2 text-slate-300">A finance agent tricked into wiring funds via a manipulated request</td>
                        <td className="p-2 text-slate-300">Direct financial loss, executed autonomously</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Scope Creep</td>
                        <td className="p-2 text-slate-300">An agent built for read-only reporting is later given write access "temporarily"</td>
                        <td className="p-2 text-slate-300">Blast radius grows quietly over time without a matching review</td>
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
                  <h4 className="font-bold text-red-400 mb-2">💥 Irreversible Real-World Actions</h4>
                  <p className="text-sm text-slate-300">Deleted data, sent emails, or transferred funds can't be undone</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🔗 Amplifies Prompt Injection</h4>
                  <p className="text-sm text-slate-300">Turns a text-manipulation bug into physical/financial consequences</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">📈 Scope Creep Over Time</h4>
                  <p className="text-sm text-slate-300">Permissions accumulate faster than they're reviewed</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">⚖️ Accountability Gaps</h4>
                  <p className="text-sm text-slate-300">Hard to assign responsibility when no human approved the action</p>
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
                <h4 className="font-bold mb-3 text-green-400">Agent Safety Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Least-Privilege Tool Grants:</strong> Scope tools per session/task, not blanket access</li>
                  <li>• <strong>Human-in-the-Loop for High Impact:</strong> Irreversible/high-value actions pause for approval</li>
                  <li>• <strong>Classify Actions by Reversibility:</strong> Not every tool call deserves the same scrutiny</li>
                  <li>• <strong>Log Every Plan and Action:</strong> Full audit trail of what the agent decided and did</li>
                  <li>• <strong>Regularly Review Granted Scope:</strong> Catch scope creep before it becomes a standing risk</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: Agent Action Classifier</h3>
              <p className="text-slate-300 mb-4">
                This simulates the checkpoint that decides whether an agent's requested action executes immediately
                or waits for human approval.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Agent request:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: Read the latest report  or  Delete all files in the backups folder"
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

export default ExcessiveAgencyModule;
