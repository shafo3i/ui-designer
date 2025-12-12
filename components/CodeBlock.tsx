import React, { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Button } from './Button';
import { Check, Copy, Terminal, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'tsx' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-zinc-800 overflow-hidden shadow-xl font-sans">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-indigo-500/10">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">Component.{language}</span>
        </div>
        <div className="flex items-center">
            <Button 
                variant="ghost" 
                onClick={handleCopy} 
                className="!h-7 !py-0 !px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
            >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Copied' : 'Copy Code'}
            </Button>
        </div>
      </div>
      
      {/* Code Editor */}
      <div className="flex-1 overflow-auto relative custom-scrollbar bg-[#1e1e1e]">
        <Highlight
          theme={themes.vsDark}
          code={code}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre 
                className="font-mono text-[13px] leading-6 p-4 min-w-full float-left tab-[2]" 
                style={{ ...style, backgroundColor: '#1e1e1e' }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row hover:bg-zinc-800/30 transition-colors w-full">
                  <span className="table-cell text-right pr-6 text-zinc-600 select-none w-[50px] text-xs opacity-50 align-top">
                    {i + 1}
                  </span>
                  <span className="table-cell align-top whitespace-pre">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};