import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { generateUIComponent } from './services/aiService';
import { GeneratedComponent, ViewMode, AISettings, DEFAULT_SETTINGS } from './types';
import { Button } from './components/Button';
import { PreviewFrame } from './components/PreviewFrame';
import { CodeBlock } from './components/CodeBlock';
import { SettingsModal } from './components/SettingsModal';
import {
  Sparkles, Code, Eye, Send, LayoutTemplate, History,
  Trash2, Plus, Download, ChevronDown, FileCode, FolderArchive,
  Zap, Box, List, CreditCard, LayoutDashboard, Menu, Settings, X
} from 'lucide-react';

const INITIAL_PROMPT = "";

const SUGGESTIONS = [
  { icon: LayoutDashboard, label: "Dashboard Grid", text: "Crypto dashboard layout with line charts and transaction list" },
  { icon: CreditCard, label: "Pricing Table", text: "SaaS pricing table with toggle for monthly/annual billing" },
  { icon: List, label: "Kanban Board", text: "Kanban task board with drag-and-drop style columns" },
  { icon: Menu, label: "Mega Navbar", text: "Responsive navbar with mega-menu and dark mode toggle" },
  { icon: Box, label: "Product Card", text: "E-commerce product card with image gallery and variant selection" },
  { icon: Zap, label: "Landing Hero", text: "Modern landing page hero section with floating elements and CTA" },
];

export default function App() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUI, setGeneratedUI] = useState<GeneratedComponent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [error, setError] = useState<string | null>(null);

  // FIX: Initialize history lazily from localStorage to prevent overwriting with empty array on mount
  const [history, setHistory] = useState<GeneratedComponent[]>(() => {
    try {
      const saved = localStorage.getItem('gemini-ui-history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse history", e);
      return [];
    }
  });

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // FIX: Initialize settings lazily from localStorage
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('gemini-ui-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error("Failed to parse settings", e);
      return DEFAULT_SETTINGS;
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gemini-ui-history', JSON.stringify(history));
  }, [history]);

  // Save settings to localStorage
  const handleSaveSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
    localStorage.setItem('gemini-ui-settings', JSON.stringify(newSettings));
  };

  // Click outside to close export menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setIsExportMenuOpen(false);

    try {
      const result = await generateUIComponent(prompt, settings);

      const newComponent: GeneratedComponent = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      setGeneratedUI(newComponent);
      setHistory(prev => [newComponent, ...prev]);
      setViewMode(ViewMode.PREVIEW);
    } catch (err: any) {
      setError(err.message || "Failed to generate UI. Please check your API key and settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (component: GeneratedComponent) => {
    setGeneratedUI(component);
    setViewMode(ViewMode.PREVIEW);
    setIsExportMenuOpen(false);
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (generatedUI?.id === id) {
      setGeneratedUI(null);
    }
  };

  const startNew = () => {
    setGeneratedUI(null);
    setPrompt('');
    setError(null);
    setIsExportMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleExport = async (type: 'tsx' | 'zip') => {
    if (!generatedUI) return;
    const componentName = generatedUI.name.replace(/[^a-zA-Z0-9]/g, '') || 'Component';

    if (type === 'tsx') {
      const blob = new Blob([generatedUI.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${componentName}.tsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'zip') {
      const zip = new JSZip();
      zip.file(`${componentName}.tsx`, generatedUI.code);

      // Add basic project structure
      zip.file('package.json', JSON.stringify({
        name: componentName.toLowerCase(),
        version: '1.0.0',
        private: true,
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.263.1",
          "clsx": "^2.0.0",
          "tailwind-merge": "^1.14.0"
        }
      }, null, 2));

      zip.file('README.md', `# ${generatedUI.name}\n\n${generatedUI.description}\n\nGenerated by Gemini UI Designer.`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${componentName}-project.zip`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExportMenuOpen(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans">

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Sidebar / History */}
      <aside
        className={`fixed md:relative z-40 h-full w-72 bg-[#09090b] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-4 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              UI
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">Designer</h1>
          </div>

          <Button
            onClick={startNew}
            variant="secondary"
            className="w-full justify-start !bg-indigo-600/10 hover:!bg-indigo-600/20 !text-indigo-400 !border-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
          <div className="px-5 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            History
          </div>

          {history.length === 0 ? (
            <div className="px-5 text-sm text-zinc-600 italic mt-2">
              No designs yet.
            </div>
          ) : (
            <ul className="space-y-0.5 px-3">
              {history.map((item) => (
                <li key={item.id} className="group relative">
                  <button
                    onClick={() => loadFromHistory(item)}
                    className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all duration-200 border border-transparent flex flex-col gap-1 ${generatedUI?.id === item.id
                      ? 'bg-zinc-800/50 text-zinc-100 border-white/5'
                      : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                      }`}
                  >
                    <span className="font-medium truncate w-full pr-6">{item.name}</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    onClick={(e) => deleteFromHistory(e, item.id)}
                    className="absolute right-2 top-3 p-1 rounded hover:bg-red-500/10 hover:text-red-400 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#09090b]">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <span className="font-mono text-[10px] opacity-50">{settings.provider}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#0c0c0e]">

        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <h2 className="font-medium text-zinc-200 truncate flex items-center gap-2">
              {generatedUI ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {generatedUI.name}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
                  New Design
                </>
              )}
            </h2>
          </div>

          {generatedUI && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <Button
                  variant="secondary"
                  className="!h-9 !px-3 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                    <button
                      onClick={() => handleExport('tsx')}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-blue-400" />
                      Download .tsx
                    </button>
                    <button
                      onClick={() => handleExport('zip')}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <FolderArchive className="w-4 h-4 text-amber-400" />
                      Download .zip
                    </button>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/5 mx-1"></div>

              {/* View Toggles */}
              <div className="flex bg-[#18181b] p-1 rounded-lg border border-white/5 flex-shrink-0">
                <button
                  onClick={() => setViewMode(ViewMode.PREVIEW)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.PREVIEW
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.CODE)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === ViewMode.CODE
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                  <Code className="w-4 h-4" />
                  Code
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Workspace Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">

          {/* Main Display Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden relative scroll-smooth pb-32">
            {!generatedUI && !isLoading && (
              <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">

                <div className="text-center space-y-6 mb-12">
                  <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-zinc-900 border border-white/5 mb-4 shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-600 tracking-tight pb-2">
                    Design with Intelligence
                  </h1>
                  <p className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Describe your component and watch it come to life. <br className="hidden md:block" />
                    Production-ready React code, instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setPrompt(s.text)}
                      className="group p-4 text-left bg-[#18181b] hover:bg-[#202023] border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <s.icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 group-hover:text-indigo-300 transition-colors">{s.label}</div>
                        <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{s.text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-medium text-white">Generating Component</h3>
                  <p className="text-zinc-500">Using {settings.provider} to build your vision...</p>
                </div>
              </div>
            )}

            {generatedUI && !isLoading && (
              <div className="h-full w-full animate-in fade-in zoom-in-95 duration-500">
                {viewMode === ViewMode.PREVIEW ? (
                  <PreviewFrame html={generatedUI.previewHtml} title={generatedUI.name} />
                ) : (
                  <CodeBlock code={generatedUI.code} />
                )}
              </div>
            )}
          </div>

          {/* Floating Prompt Input */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none z-20 flex justify-center bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent">
            <div className="w-full max-w-3xl pointer-events-auto relative group">
              {error && (
                <div className="absolute bottom-full left-0 right-0 mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
              )}
              {/* Glowing backdrop */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 transition duration-500 blur ${isLoading ? 'opacity-20 animate-pulse' : 'group-focus-within:opacity-20'}`}></div>

              <div className="relative flex flex-col bg-[#18181b] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the UI you want to build..."
                  className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-500 px-5 py-4 focus:ring-0 resize-none min-h-[60px] max-h-[200px] text-[15px] leading-relaxed"
                  rows={1}
                />

                <div className="flex items-center justify-between px-3 pb-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors" title="Attach image (coming soon)">
                      <div className="w-5 h-5 border-2 border-dashed border-current rounded-md"></div>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 hidden sm:inline-block">
                      <kbd className="font-sans bg-zinc-800/50 border border-white/5 px-1.5 py-0.5 rounded text-zinc-500">Cmd + Enter</kbd> to send
                    </span>
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={isLoading || !prompt.trim()}
                      variant="primary"
                      className="!rounded-xl !px-4 !py-2 !h-10"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="ml-1">Generate</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}