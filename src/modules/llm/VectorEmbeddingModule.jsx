import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, Home, Network, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const VectorEmbeddingModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/ask")
async def ask(question: str, user_id: str):
    """⚠️ VULNERABLE - retrieval has no per-user access control"""
    # DANGEROUS: every document from every tenant lives in one shared
    # vector index, and similarity search doesn't filter by ownership
    results = vector_db.similarity_search(question, k=5)

    context = "\\n".join(r.text for r in results)
    response = generate_answer(question, context)
    return {"answer": response}`;

  const secureCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/ask")
async def ask(question: str, user_id: str):
    """✅ SECURE - retrieval enforces the same access control as the rest of the app"""
    # SAFE: every query is filtered to only the documents this user/tenant
    # is actually authorized to see
    results = vector_db.similarity_search(
        question, k=5, filter={"tenant_id": get_tenant_for_user(user_id)}
    )

    # SAFE: treat retrieved content as untrusted too - it could contain
    # embedded instructions (indirect prompt injection risk)
    context = sanitize_retrieved_content(results)
    response = generate_answer(question, context)
    return {"answer": response}`;

  const comparisonCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/ask")
async def ask(question: str, user_id: str):
    """✅ SECURE - retrieval enforces the same access control as the rest of the app"""

    # ❌ OLD (VULNERABLE): vector_db.similarity_search(question, k=5)
    # searches across ALL tenants' documents with no ownership filter

    # ✅ NEW (SECURE): scoped to only what this user is authorized to see
    results = vector_db.similarity_search(
        question, k=5, filter={"tenant_id": get_tenant_for_user(user_id)}
    )

    # ✅ NEW: retrieved content is untrusted input too, not just the question
    context = sanitize_retrieved_content(results)
    response = generate_answer(question, context)
    return {"answer": response}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What's the most common real-world cause of cross-tenant leakage in RAG (retrieval-augmented generation) systems?",
      options: [
        "Using too small an embedding model",
        "A shared vector index with no access-control metadata/filter, so semantic search can surface documents the requesting user was never authorized to see",
        "Storing embeddings as floating point numbers instead of integers",
        "Using cosine similarity instead of Euclidean distance"
      ],
      correct: 1,
      explanation: "Embeddings by themselves carry no notion of 'who's allowed to see this.' If retrieval doesn't explicitly filter by tenant/user/permission, similarity search will happily return the most relevant match regardless of ownership."
    },
    {
      id: 2,
      question: "Why should retrieved document content be treated as untrusted, similar to prompt injection?",
      options: [
        "It shouldn't - documents in your own database are always safe",
        "A document could contain hidden instructions crafted to manipulate the model when it's included as context - an indirect prompt injection vector",
        "Retrieved content is always shorter than user input, so it's inherently safer",
        "This only matters for PDF files, never plain text"
      ],
      correct: 1,
      explanation: "Anything fed into the model's context - including retrieved documents - can carry embedded instructions an attacker placed there deliberately (e.g. in a shared document or public webpage). Retrieval doesn't exempt content from this risk."
    },
    {
      id: 3,
      question: "What access-control principle should retrieval-augmented systems follow?",
      options: [
        "Retrieval is a separate system and doesn't need to follow the app's access control",
        "The exact same authorization rules that apply everywhere else in the application should also apply to what gets retrieved and shown to the model",
        "Only encrypt the vector database, no filtering needed",
        "Access control only matters for the final answer, not the retrieval step"
      ],
      correct: 1,
      explanation: "If a user couldn't see a document through the normal application UI, retrieval shouldn't be able to surface it into the model's context either - the vector search step needs the same authorization boundary as everything else."
    },
    {
      id: 4,
      question: "Besides access control, what's another embedding-specific risk worth knowing about?",
      options: [
        "Embeddings are immune to any form of manipulation",
        "Embedding inversion - techniques that can reconstruct approximate original text from its embedding vector, which matters if embeddings of sensitive data are ever exposed",
        "Embeddings can only be generated by one specific vendor",
        "Vector databases can't be backed up"
      ],
      correct: 1,
      explanation: "Embeddings aren't just meaningless numbers - research has shown it's sometimes possible to approximately reconstruct sensitive source text from its embedding vector, so exposing raw embeddings of confidential data carries its own disclosure risk."
    }
  ];

  const handleLabSubmit = () => {
    const lower = labInput.toLowerCase();
    const crossTenant = lower.includes('other') || lower.includes('another user') || lower.includes('everyone') || lower.includes('all tenants') || lower.includes('all documents');

    if (crossTenant) {
      setLabResult({
        safe: false,
        message: "⚠️ Unscoped Retrieval Requested!",
        impact: "A query like this, run against a shared index with no per-tenant filter, would retrieve whatever is semantically similar across ALL users' documents - not just the requester's own. The secure version adds a tenant_id filter to every retrieval call so this can't happen structurally."
      });
    } else {
      setLabResult({ safe: true, message: "✅ Query scoped to the requesting user's own documents", impact: "This looks like a normal, appropriately-scoped question. Remember that even scoped retrieval still needs its returned content treated as untrusted before it's added to the model's context." });
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
            <Network className="w-10 h-10 text-emerald-400" />
            <h1 className="text-4xl font-bold">Vector and Embedding Weaknesses</h1>
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
                Retrieval-augmented generation (RAG) systems store documents as vector embeddings and retrieve the
                most semantically relevant ones to include as context. Without access-control filtering built into
                that retrieval step, semantic search will happily return content the requesting user was never
                authorized to see.
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
                        <td className="p-2 font-semibold text-red-400">Cross-Tenant Retrieval</td>
                        <td className="p-2 text-slate-300">A broad question retrieves another customer's confidential documents</td>
                        <td className="p-2 text-slate-300">Data from one account exposed to a completely different account</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">Embedded Instructions in Documents</td>
                        <td className="p-2 text-slate-300">A retrieved document contains hidden "ignore prior instructions" text</td>
                        <td className="p-2 text-slate-300">Indirect prompt injection delivered through the retrieval pipeline</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Embedding Inversion</td>
                        <td className="p-2 text-slate-300">Reconstructing approximate source text from an exposed embedding vector</td>
                        <td className="p-2 text-slate-300">Sensitive data recovered even without direct access to the original document</td>
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
                  <h4 className="font-bold text-red-400 mb-2">👥 Cross-Customer Data Exposure</h4>
                  <p className="text-sm text-slate-300">One tenant's confidential content surfaced to another</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">💉 Indirect Injection Delivery</h4>
                  <p className="text-sm text-slate-300">Malicious instructions smuggled in through retrieved content</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🔓 Embedding-Based Reconstruction</h4>
                  <p className="text-sm text-slate-300">Exposed vectors can leak approximate source content</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">⚖️ Multi-Tenant Compliance Failure</h4>
                  <p className="text-sm text-slate-300">Breaks data-isolation guarantees promised to enterprise customers</p>
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
                <h4 className="font-bold mb-3 text-green-400">RAG Security Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Filter Every Retrieval:</strong> Attach and enforce tenant/user/permission metadata on every vector query</li>
                  <li>• <strong>Match Existing Access Control:</strong> Retrieval should never bypass the app's normal authorization rules</li>
                  <li>• <strong>Sanitize Retrieved Content:</strong> Treat documents as untrusted input, same as user-typed text</li>
                  <li>• <strong>Protect Raw Embeddings:</strong> Don't expose embedding vectors of sensitive data unnecessarily</li>
                  <li>• <strong>Test Cross-Tenant Isolation Explicitly:</strong> Verify retrieval boundaries as part of your security testing, not just functional testing</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: RAG Retrieval Scope Checker</h3>
              <p className="text-slate-300 mb-4">
                This simulates a question being run against a vector index and checks whether it looks scoped to the
                requesting user's own data.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">Question:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder="Try: Summarize my latest invoice  or  Show me documents from all tenants"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Ask</button>
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

export default VectorEmbeddingModule;
