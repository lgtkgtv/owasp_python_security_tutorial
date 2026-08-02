import { Bot, Boxes, Code2, Database, Eye, EyeOff, FileOutput, FileWarning, Fingerprint, FlaskConical, FolderOpen, Globe, Infinity, KeyRound, Lock, Megaphone, Network, PackageSearch, PackageX, Radar, RefreshCw, ScrollText, Settings, Syringe } from 'lucide-react';

const moduleConfigs = {
  sqlinjection: {
    id: 'sqlinjection',
    title: 'SQL Injection (SQLi)',
    icon: Database,
    owasp: 'OWASP #3',
    cwe: 'CWE-89',
    severity: 'Critical',
    description: 'SQL Injection exploits security vulnerabilities in database-driven applications by injecting malicious SQL code.',
    color: 'red',
    track: 'web'
  },
  xss: {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS)',
    icon: Eye,
    owasp: 'OWASP #3',
    cwe: 'CWE-79',
    severity: 'High',
    description: 'XSS allows attackers to inject malicious scripts into web pages viewed by other users.',
    color: 'orange',
    track: 'web'
  },
  brokenauth: {
    id: 'brokenauth',
    title: 'Broken Authentication',
    icon: Lock,
    owasp: 'OWASP #7',
    cwe: 'CWE-287',
    severity: 'Critical',
    description: 'Broken authentication allows attackers to compromise passwords, keys, or session tokens.',
    color: 'yellow',
    track: 'web'
  },
  csrf: {
    id: 'csrf',
    title: 'Cross-Site Request Forgery (CSRF)',
    icon: RefreshCw,
    owasp: 'OWASP A01:2021',
    cwe: 'CWE-352',
    severity: 'High',
    description: 'CSRF tricks a logged-in user\'s browser into submitting unwanted requests to a site they trust.',
    color: 'pink',
    track: 'web'
  },
  pathtraversal: {
    id: 'pathtraversal',
    title: 'Path Traversal',
    icon: FolderOpen,
    owasp: 'OWASP A01:2021',
    cwe: 'CWE-22',
    severity: 'High',
    description: 'Path traversal lets attackers escape the intended directory to read or write arbitrary files.',
    color: 'blue',
    track: 'web'
  },
  commandinjection: {
    id: 'commandinjection',
    title: 'Command Injection',
    icon: Code2,
    owasp: 'OWASP A03:2021',
    cwe: 'CWE-78',
    severity: 'Critical',
    description: 'Command injection lets attackers execute arbitrary OS commands through unsanitized input.',
    color: 'red',
    track: 'web'
  },
  deserialization: {
    id: 'deserialization',
    title: 'Insecure Deserialization',
    icon: PackageX,
    owasp: 'OWASP A08:2021',
    cwe: 'CWE-502',
    severity: 'Critical',
    description: 'Deserializing untrusted data can execute arbitrary code or tamper with application objects.',
    color: 'purple',
    track: 'web'
  },
  xxe: {
    id: 'xxe',
    title: 'XML External Entities (XXE)',
    icon: FileWarning,
    owasp: 'OWASP A05:2021',
    cwe: 'CWE-611',
    severity: 'High',
    description: 'XXE abuses XML parsers that resolve external entities, exposing files or internal services.',
    color: 'orange',
    track: 'web'
  },
  ssrf: {
    id: 'ssrf',
    title: 'Server-Side Request Forgery (SSRF)',
    icon: Globe,
    owasp: 'OWASP A10:2021',
    cwe: 'CWE-918',
    severity: 'High',
    description: 'SSRF tricks the server into making requests to internal or unintended destinations.',
    color: 'cyan',
    track: 'web'
  },
  secmisconfig: {
    id: 'secmisconfig',
    title: 'Security Misconfiguration',
    icon: Settings,
    owasp: 'OWASP A05:2021',
    cwe: 'Multiple',
    severity: 'Medium',
    description: 'Insecure defaults, permissive CORS, debug mode, and unauthenticated routes left in production.',
    color: 'gray',
    track: 'web'
  },
  sensitivedata: {
    id: 'sensitivedata',
    title: 'Sensitive Data Exposure',
    icon: EyeOff,
    owasp: 'OWASP A02:2021',
    cwe: 'CWE-311',
    severity: 'High',
    description: 'Weak cryptography, plaintext storage, and unencrypted transport expose sensitive data.',
    color: 'indigo',
    track: 'web'
  },
  brokenaccess: {
    id: 'brokenaccess',
    title: 'Broken Access Control (IDOR)',
    icon: Fingerprint,
    owasp: 'OWASP #1',
    cwe: 'CWE-639',
    severity: 'Critical',
    description: "Missing object-level authorization lets one user access or modify another user's data just by changing an ID.",
    color: 'green',
    track: 'web'
  },
  vulncomponents: {
    id: 'vulncomponents',
    title: 'Vulnerable & Outdated Components',
    icon: Boxes,
    owasp: 'OWASP A06:2021',
    cwe: 'CWE-1104',
    severity: 'High',
    description: 'Using libraries with known CVEs, left unpinned or unpatched, hands attackers a ready-made exploit.',
    color: 'teal',
    track: 'web'
  },
  loggingfailures: {
    id: 'loggingfailures',
    title: 'Security Logging & Monitoring Failures',
    icon: ScrollText,
    owasp: 'OWASP A09:2021',
    cwe: 'CWE-778',
    severity: 'Medium',
    description: 'Missing security event logging - or logging secrets in the clear - lets breaches go undetected for months.',
    color: 'amber',
    track: 'web'
  },
  promptinjection: {
    id: 'promptinjection',
    title: 'Prompt Injection',
    icon: Syringe,
    owasp: 'LLM01:2025',
    cwe: 'N/A',
    severity: 'Critical',
    description: 'User input and developer instructions share one token stream, letting attackers override intended behavior.',
    color: 'rose',
    track: 'llm'
  },
  llmsensitiveinfo: {
    id: 'llmsensitiveinfo',
    title: 'Sensitive Information Disclosure',
    icon: Radar,
    owasp: 'LLM02:2025',
    cwe: 'N/A',
    severity: 'High',
    description: "Secrets or other users' data embedded in a model's context can be extracted through clever prompting.",
    color: 'amber',
    track: 'llm'
  },
  llmsupplychain: {
    id: 'llmsupplychain',
    title: 'Supply Chain',
    icon: PackageSearch,
    owasp: 'LLM03:2025',
    cwe: 'N/A',
    severity: 'High',
    description: 'Unpinned dependencies, unverified model weights, and over-permissioned plugins introduce hidden risk.',
    color: 'teal',
    track: 'llm'
  },
  datapoisoning: {
    id: 'datapoisoning',
    title: 'Data and Model Poisoning',
    icon: FlaskConical,
    owasp: 'LLM04:2025',
    cwe: 'N/A',
    severity: 'High',
    description: "Unvalidated training/fine-tuning data lets attackers bias a model's future behavior.",
    color: 'lime',
    track: 'llm'
  },
  outputhandling: {
    id: 'outputhandling',
    title: 'Improper Output Handling',
    icon: FileOutput,
    owasp: 'LLM05:2025',
    cwe: 'N/A',
    severity: 'Critical',
    description: 'Rendering or executing model output without validation reintroduces XSS, SQLi, and command injection.',
    color: 'sky',
    track: 'llm'
  },
  excessiveagency: {
    id: 'excessiveagency',
    title: 'Excessive Agency',
    icon: Bot,
    owasp: 'LLM06:2025',
    cwe: 'N/A',
    severity: 'Critical',
    description: 'Agents granted more autonomy or tool access than needed turn manipulated plans into real-world actions.',
    color: 'violet',
    track: 'llm'
  },
  systempromptleakage: {
    id: 'systempromptleakage',
    title: 'System Prompt Leakage',
    icon: KeyRound,
    owasp: 'LLM07:2025',
    cwe: 'N/A',
    severity: 'Medium',
    description: 'Business logic or configuration embedded in a system prompt can be extracted by a determined user.',
    color: 'fuchsia',
    track: 'llm'
  },
  vectorembedding: {
    id: 'vectorembedding',
    title: 'Vector and Embedding Weaknesses',
    icon: Network,
    owasp: 'LLM08:2025',
    cwe: 'N/A',
    severity: 'Medium',
    description: 'Unscoped retrieval in RAG systems can surface documents a user was never authorized to see.',
    color: 'emerald',
    track: 'llm'
  },
  misinformation: {
    id: 'misinformation',
    title: 'Misinformation',
    icon: Megaphone,
    owasp: 'LLM09:2025',
    cwe: 'N/A',
    severity: 'Medium',
    description: 'Confidently-stated, ungrounded model output presented as fact can cause real-world harm.',
    color: 'stone',
    track: 'llm'
  },
  unboundedconsumption: {
    id: 'unboundedconsumption',
    title: 'Unbounded Consumption',
    icon: Infinity,
    owasp: 'LLM10:2025',
    cwe: 'N/A',
    severity: 'High',
    description: 'Missing limits on request rate, input/output size, or execution time enable cost and resource abuse.',
    color: 'orange',
    track: 'llm'
  }
};

export default moduleConfigs;
