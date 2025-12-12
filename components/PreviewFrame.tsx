import React, { useRef, useEffect } from 'react';

interface PreviewFrameProps {
  html: string;
  title: string;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ html, title }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  }, [html]);

  return (
    <div className="w-full h-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/5 flex flex-col">
      {/* Browser Toolbar */}
      <div className="h-10 bg-[#18181b] border-b border-white/5 flex items-center px-4 gap-4 select-none">
        <div className="flex gap-1.5 group">
          <div className="w-3 h-3 rounded-full bg-[#27272a] group-hover:bg-[#ff5f56] transition-colors duration-300"></div>
          <div className="w-3 h-3 rounded-full bg-[#27272a] group-hover:bg-[#ffbd2e] transition-colors duration-300"></div>
          <div className="w-3 h-3 rounded-full bg-[#27272a] group-hover:bg-[#27c93f] transition-colors duration-300"></div>
        </div>
        
        {/* Fake Address Bar */}
        <div className="flex-1 flex justify-center max-w-lg mx-auto">
          <div className="bg-[#09090b] text-zinc-500 text-xs px-3 py-1 rounded-md w-full text-center font-mono border border-white/5 flex items-center justify-center gap-2">
            <span className="text-zinc-600">🔒</span>
            localhost:3000
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
          </div>
        </div>
        
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      <iframe
        ref={iframeRef}
        title={`Preview: ${title}`}
        className="flex-1 w-full bg-white"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      />
    </div>
  );
};