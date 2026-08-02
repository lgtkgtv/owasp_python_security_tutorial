import React, { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Code, FileWarning, Home, Network, Shield, Terminal, Trophy } from 'lucide-react';
import PythonCode from '../../components/PythonCode';
import Quiz from '../../components/Quiz';

const XXEModule = ({ onBack, onSectionComplete, completedSections }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [codeView, setCodeView] = useState('comparison');
  const [labInput, setLabInput] = useState('');
  const [labResult, setLabResult] = useState(null);

  const vulnerableCode = `from fastapi import FastAPI, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """⚠️ VULNERABLE - Parser resolves external entities"""
    body = await request.body()
    # DANGEROUS: resolve_entities=True lets a DOCTYPE/ENTITY
    # declaration pull in local files or make outbound requests
    parser = etree.XMLParser(resolve_entities=True)
    tree = etree.fromstring(body, parser)
    return {"root_tag": tree.tag}`;

  const secureCode = `from fastapi import FastAPI, HTTPException, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """✅ SECURE - Disables external entity and DTD resolution"""
    body = await request.body()

    # SAFE: explicitly disable external entities, network access,
    # and DTD processing at the parser level
    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        dtd_validation=False,
        load_dtd=False,
        huge_tree=False
    )
    try:
        tree = etree.fromstring(body, parser)
    except etree.XMLSyntaxError:
        raise HTTPException(400, "Invalid XML")

    return {"root_tag": tree.tag}`;

  const comparisonCode = `from fastapi import FastAPI, HTTPException, Request
from lxml import etree

app = FastAPI()

@app.post("/import/xml")
async def import_xml(request: Request):
    """✅ SECURE - Disables external entity and DTD resolution"""
    body = await request.body()

    # ❌ OLD (VULNERABLE): resolve_entities=True
    # parser = etree.XMLParser(resolve_entities=True)

    # ✅ NEW (SECURE): entities, network access, and DTDs all disabled
    parser = etree.XMLParser(
        resolve_entities=False, no_network=True, dtd_validation=False, load_dtd=False
    )
    try:
        tree = etree.fromstring(body, parser)
    except etree.XMLSyntaxError:
        raise HTTPException(400, "Invalid XML")

    return {"root_tag": tree.tag}`;

  const quizQuestions = [
    {
      id: 1,
      question: "What XML feature does XXE abuse?",
      options: [
        "XML namespaces",
        "DTDs (Document Type Definitions) and external entity declarations that can reference local files or URLs",
        "XML comments",
        "CDATA sections"
      ],
      correct: 1,
      explanation: "A DOCTYPE can declare a custom ENTITY pointing at a file:// path or a URL. If the parser resolves it, that content gets substituted into the document."
    },
    {
      id: 2,
      question: "What is the single most effective way to prevent XXE?",
      options: [
        "Encrypting the XML payload",
        "Disabling DTD processing and external entity resolution in the XML parser entirely",
        "Requiring authentication before parsing",
        "Compressing the XML before sending it"
      ],
      correct: 1,
      explanation: "If the parser never processes DTDs or resolves external entities in the first place, there's no mechanism left for an attacker to abuse - regardless of how the payload is crafted."
    },
    {
      id: 3,
      question: "Can XXE be used for SSRF (Server-Side Request Forgery)?",
      options: [
        "No, XXE only reads local files",
        "Yes - an external entity pointing at an internal URL forces the server to fetch it",
        "Only if the server has no firewall",
        "Only in XML versions before 1.0"
      ],
      correct: 1,
      explanation: "An ENTITY declared as SYSTEM \"http://internal-service/admin\" makes the XML parser itself issue that request, effectively turning the parser into an SSRF vector."
    },
    {
      id: 4,
      question: "What is the 'Billion Laughs' attack?",
      options: [
        "A phishing technique using humorous emails",
        "A form of entity-expansion denial of service where nested entity references expand exponentially, exhausting memory/CPU",
        "A SQL injection variant",
        "A CSRF technique involving multiple forms"
      ],
      correct: 1,
      explanation: "Each entity is defined in terms of several copies of the previous one. A handful of definitions can expand to billions of characters in memory when resolved, crashing the parser/process."
    }
  ];

  const handleLabSubmit = () => {
    const input = labInput;
    const hasDoctype = /<!DOCTYPE/i.test(input);
    const hasEntity = /<!ENTITY/i.test(input) || /&\w+;/.test(input);
    const hasSystem = /SYSTEM/i.test(input);

    if (hasDoctype && (hasEntity || hasSystem)) {
      let leak = 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000::/home/admin:/bin/bash';
      let impact = "🔓 CRITICAL: The parser resolved your external entity and substituted the referenced content directly into the response.";
      if (/http:\/\/|internal|169\.254/i.test(input)) {
        leak = '[simulated] outbound HTTP request issued to internal-only host from the server itself';
        impact = "🌐 SSRF via XXE: The entity pointed at an internal URL, so the XML parser made the request on the server's behalf - reaching hosts that aren't exposed to the internet.";
      }
      setLabResult({ safe: false, message: "⚠️ XXE Detected!", impact, leak });
    } else {
      let tag = 'unknown';
      const match = input.match(/<(\w+)/);
      if (match) tag = match[1];
      setLabResult({ safe: true, message: `✅ Parsed normally - root tag: <${tag}>`, impact: "No DOCTYPE/ENTITY declarations found, so there was nothing for the parser to resolve.", leak: null });
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
            <FileWarning className="w-10 h-10 text-orange-400" />
            <h1 className="text-4xl font-bold">XML External Entities (XXE)</h1>
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
                XXE occurs when an XML parser processes a Document Type Definition (DTD) that declares external entities. If the parser
                resolves these entities, an attacker can make the server read local files, issue internal network requests, or exhaust
                resources - all just by submitting crafted XML.
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
                        <th className="text-left p-2 text-purple-400">Payload</th>
                        <th className="text-left p-2 text-purple-400">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">File Disclosure</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">{'<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'}</code></td>
                        <td className="p-2 text-slate-300">Embeds a local file's contents into the parsed response</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-red-400">SSRF via Entity</td>
                        <td className="p-2"><code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-xs">{'<!ENTITY xxe SYSTEM "http://internal-service:8080/admin">'}</code></td>
                        <td className="p-2 text-slate-300">Forces the server to request an internal-only URL</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="p-2 font-semibold text-orange-400">Billion Laughs</td>
                        <td className="p-2 text-slate-300">Nested entities each referencing the previous ~10x</td>
                        <td className="p-2 text-slate-300">Exponential memory/CPU blowup, crashing the service</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-orange-400">Out-of-Band Exfiltration</td>
                        <td className="p-2 text-slate-300">Parameter entities leaking data via attacker-controlled DNS/HTTP</td>
                        <td className="p-2 text-slate-300">Works even when the response isn't directly reflected</td>
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
                  <h4 className="font-bold text-red-400 mb-2">📄 Local File Disclosure</h4>
                  <p className="text-sm text-slate-300">Reads server files the application never intended to expose</p>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-orange-400 mb-2">🌐 Internal SSRF</h4>
                  <p className="text-sm text-slate-300">Pivots into the internal network via the parser's requests</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">🐢 Denial of Service</h4>
                  <p className="text-sm text-slate-300">Entity expansion attacks exhaust memory/CPU</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-400 mb-2">💥 Remote Code Execution</h4>
                  <p className="text-sm text-slate-300">Possible in some platform/parser combinations</p>
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
                <h4 className="font-bold mb-3 text-green-400">XXE Defense Checklist:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Disable DTDs Entirely:</strong> Most applications never need custom DOCTYPEs</li>
                  <li>• <strong>Disable External Entity Resolution:</strong> resolve_entities=False (or equivalent in your parser)</li>
                  <li>• <strong>Disable Network Access for the Parser:</strong> no_network=True prevents outbound requests</li>
                  <li>• <strong>Prefer JSON:</strong> If you control the format, avoid XML for untrusted input entirely</li>
                  <li>• <strong>Keep XML Libraries Updated:</strong> Some defaults have changed over time to be safer</li>
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
              <h3 className="text-2xl font-bold mb-4">🧪 Interactive Lab: XML Import Endpoint</h3>
              <p className="text-slate-300 mb-4">
                This simulates <code className="bg-slate-900 px-2 py-1 rounded">POST /import/xml</code> against a parser with entity
                resolution enabled. Try a normal XML document, then try a DOCTYPE with an external entity.
              </p>
              <div className="bg-slate-900 rounded-lg p-6">
                <label className="block mb-2 font-semibold">XML body:</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={labInput}
                    onChange={(e) => setLabInput(e.target.value)}
                    placeholder={'Try: <note><to>Bob</to></note>  or  <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>'}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                  <button onClick={handleLabSubmit} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold">Parse XML</button>
                </div>
              </div>

              {labResult && (
                <div className={`mt-4 rounded-lg p-4 border ${labResult.safe ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className={`font-bold ${labResult.safe ? 'text-green-400' : 'text-red-400'}`}>{labResult.message}</p>
                  <p className="text-sm text-slate-300 mt-2">{labResult.impact}</p>
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

export default XXEModule;
