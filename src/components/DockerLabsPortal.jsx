import React, { useState } from 'react';
import {
  ArrowLeft, Search, Terminal, GitBranch, Play, Trash2,
  AlertTriangle, Mail, ExternalLink
} from 'lucide-react';
// The 24 runnable Docker lab pairs -- single source of truth lives in
// examples/modules.json (also read by examples/generate_root_compose.py
// and used to regenerate examples/lab-portal.html's embedded copy).
import MODULES from '../../examples/modules.json';

const TRACK_GROUPS = [
  { key: 'web', heading: '🐍 Python & Web Application Security', sub: 'Classic OWASP Top 10 / CWE Top 25 — 15 modules' },
  { key: 'llm', heading: '🤖 AI / LLM Application Security', sub: 'OWASP Top 10 for LLM Applications (2025) — 10 modules, mock LLM (no API key/cost)' }
];

const REPO_URL = 'https://github.com/lgtkgtv/owasp_python_security_tutorial.git';

const DockerLabsPortal = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('all');

  const q = query.trim().toLowerCase();
  const matches = (m) =>
    !q || m.title.toLowerCase().includes(q) || m.owasp.toLowerCase().includes(q) || m.cwe.toLowerCase().includes(q);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to all modules
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            🐳 Runnable Docker Labs
          </h1>
          <p className="text-slate-300">
            Every module above also ships as a real, runnable vulnerable/secure FastAPI pair — 24 modules, 48 containers.
          </p>
        </div>

        {/* Safety note */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">
            These apps are <strong>deliberately vulnerable by design</strong>. They run entirely on
            your own machine and are never reachable from this website — this page only links to{' '}
            <code className="bg-black/30 px-1 rounded">localhost</code> ports that exist if and only if you
            start the containers yourself. Never deploy them to a public server or expose their ports
            beyond your own machine.
          </p>
        </div>

        {/* Prerequisites & Setup */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" /> Prerequisites &amp; Setup
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <span className="text-purple-400">1.</span> Prerequisites
              </h3>
              <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                <li>Git</li>
                <li>Docker Engine + Docker Compose plugin (Docker Desktop, or native Docker on Linux/WSL2)</li>
                <li>Ports 8001–8048 free on your machine</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" /> 2. Clone the repo
              </h3>
              <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
{`git clone ${REPO_URL}
cd owasp_python_security_tutorial`}
              </pre>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4 text-green-400" /> 3. Build &amp; run
              </h3>
              <p className="text-xs text-slate-400 mb-2">All 24 pairs (48 containers) at once:</p>
              <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
{`cd examples
docker compose up --build -d`}
              </pre>
              <p className="text-xs text-slate-400 mt-2 mb-2">Or just one module, e.g. SQL Injection:</p>
              <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
{`cd examples/web/sqlinjection
docker compose up --build`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-pink-400" /> 4. Clean up when done
              </h3>
              <p className="text-xs text-slate-400 mb-2">Stop and remove containers/network:</p>
              <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
{`docker compose down`}
              </pre>
              <p className="text-xs text-slate-400 mt-2 mb-2">Also remove the built images (full reclaim):</p>
              <pre className="bg-black/40 rounded-lg p-3 text-xs text-slate-200 overflow-x-auto">
{`docker compose down --rmi all`}
              </pre>
              <p className="text-xs text-slate-500 mt-2">
                Pausing for later? Use <code className="bg-black/30 px-1 rounded">docker compose stop</code> and{' '}
                <code className="bg-black/30 px-1 rounded">docker compose start</code> instead of tearing down.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Full details, per-module READMEs, and the shared mock-LLM used by the LLM track live in{' '}
            <code className="bg-black/30 px-1 rounded">examples/README.md</code> in the repo.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, OWASP id, or CWE..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900/70 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {[
            { key: 'all', label: `All (${MODULES.length})` },
            { key: 'web', label: `Web (${MODULES.filter(m => m.track === 'web').length})` },
            { key: 'llm', label: `LLM (${MODULES.filter(m => m.track === 'llm').length})` }
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setTrack(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                track === btn.key
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Module grid, grouped by track */}
        {TRACK_GROUPS.filter(g => track === 'all' || track === g.key).map(g => {
          const mods = MODULES.filter(m => m.track === g.key).filter(matches);
          if (mods.length === 0) return null;
          return (
            <div key={g.key} className="mb-10">
              <h2 className="text-2xl font-bold mb-1">{g.heading}</h2>
              <p className="text-slate-400 text-sm mb-4">{g.sub}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mods.map(m => (
                  <div
                    key={m.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 flex flex-col gap-2"
                  >
                    <div className="font-bold">{m.title}</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded-full text-xs">{m.owasp}</span>
                      <span className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded-full text-xs">{m.cwe}</span>
                    </div>
                    <p className="text-sm text-slate-400">{m.desc}</p>
                    <pre className="bg-black/30 rounded p-2 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                      {m.hint}
                    </pre>
                    <div className="flex gap-2 mt-1">
                      <a
                        href={`http://localhost:${m.vuln}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500/15 border border-red-500/40 text-red-300 hover:brightness-125 transition-all"
                      >
                        Vulnerable :{m.vuln}
                      </a>
                      <a
                        href={`http://localhost:${m.secure}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-500/15 border border-green-500/40 text-green-300 hover:brightness-125 transition-all"
                      >
                        Secure :{m.secure}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer / feedback */}
        <div className="mt-8 text-center text-slate-400 text-sm border-t border-slate-800 pt-6">
          <p>Everything above is deliberately vulnerable-by-design. Local use only — never expose these ports publicly.</p>
          <p className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <Mail className="w-4 h-4" />
            Feedback &amp; feature requests: Sachin Godse —{' '}
            <a
              href="mailto:lgtkgtv+sachin-godse@gmail.com"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              lgtkgtv+sachin-godse@gmail.com
            </a>
          </p>
          <p className="mt-3">
            <a
              href={REPO_URL.replace(/\.git$/, '')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
            >
              View source on GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DockerLabsPortal;
