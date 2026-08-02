import React from 'react';

const PythonCode = ({ code, className = "" }) => {
  const highlightPython = (code) => {
    const keywords = ['from', 'import', 'async', 'await', 'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with', 'as', 'raise', 'finally', 'in', 'not', 'and', 'or'];
    const builtins = ['str', 'int', 'float', 'list', 'dict', 'tuple', 'set', 'None', 'True', 'False'];
    
    const lines = code.split('\n');
    return lines.map((line, lineIdx) => {
      const commentMatch = line.match(/^(\s*)(#.*)/);
      if (commentMatch) {
        const indent = commentMatch[1];
        const comment = commentMatch[2];
        
        if (comment.includes('❌') || comment.toLowerCase().includes('old') || comment.toLowerCase().includes('vulnerable') || comment.toLowerCase().includes('dangerous')) {
          return (
            <div key={lineIdx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <span style={{ color: '#64748b' }}>{indent}</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{comment}</span>
            </div>
          );
        }
        
        if (comment.includes('✅') || comment.toLowerCase().includes('new') || comment.toLowerCase().includes('secure') || comment.toLowerCase().includes('safe')) {
          return (
            <div key={lineIdx} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <span style={{ color: '#64748b' }}>{indent}</span>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{comment}</span>
            </div>
          );
        }
        
        return (
          <div key={lineIdx}>
            <span style={{ color: '#64748b' }}>{indent}</span>
            <span style={{ color: '#94a3b8' }}>{comment}</span>
          </div>
        );
      }
      
      if (line.trim().startsWith('@')) {
        return <div key={lineIdx} style={{ color: '#fbbf24' }}>{line}</div>;
      }
      
      if (line.trim().startsWith('"""') || line.trim().startsWith("'''")) {
        const color = line.includes('VULNERABLE') ? '#ef4444' : line.includes('SECURE') ? '#22c55e' : '#86efac';
        return <div key={lineIdx} style={{ color: color, fontStyle: 'italic' }}>{line}</div>;
      }
      
      const tokens = line.split(/(\s+|[(){}[\],.:]|"[^"]*"|'[^']*')/g).filter(t => t);
      
      return (
        <div key={lineIdx}>
          {tokens.map((token, idx) => {
            if (token.startsWith('"') || token.startsWith("'")) {
              return <span key={idx} style={{ color: '#86efac' }}>{token}</span>;
            }
            if (keywords.includes(token)) {
              return <span key={idx} style={{ color: '#c084fc', fontWeight: '600' }}>{token}</span>;
            }
            if (builtins.includes(token)) {
              return <span key={idx} style={{ color: '#60a5fa' }}>{token}</span>;
            }
            if (tokens[idx - 1] === 'def' || tokens[idx - 1] === 'class') {
              return <span key={idx} style={{ color: '#fbbf24', fontWeight: '600' }}>{token}</span>;
            }
            if (token.match(/^\s+$/)) {
              return <span key={idx}>{token}</span>;
            }
            return <span key={idx} style={{ color: '#e2e8f0' }}>{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <pre className={`bg-slate-900 p-4 rounded overflow-x-auto text-sm font-mono leading-relaxed ${className}`}>
      {highlightPython(code)}
    </pre>
  );
};

export default PythonCode;
