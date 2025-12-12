
import React, { useState, useEffect } from 'react';
import { X, Save, Key, Cpu, Globe } from 'lucide-react';
import { AISettings, AIProvider, DEFAULT_SETTINGS } from '../types';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

const PROVIDERS: { id: AIProvider; name: string; defaultModel: string }[] = [
  { id: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-2.5-flash' },
  { id: 'openai', name: 'OpenAI (ChatGPT)', defaultModel: 'gpt-4o' },
  { id: 'anthropic', name: 'Anthropic (Claude)', defaultModel: 'claude-3-5-sonnet-latest' },
  { id: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-chat' },
  { id: 'xai', name: 'xAI (Grok)', defaultModel: 'grok-beta' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleChange = (field: keyof AISettings, value: string) => {
    setLocalSettings(prev => {
        // Auto-update model if provider changes to valid default
        if (field === 'provider') {
            const provider = PROVIDERS.find(p => p.id === value);
            return {
                ...prev,
                provider: value as AIProvider,
                model: provider ? provider.defaultModel : prev.model
            };
        }
        return { ...prev, [field]: value };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#18181b]">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            AI Settings
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">AI Provider</label>
            <div className="relative">
              <select 
                value={localSettings.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 appearance-none"
              >
                {PROVIDERS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Globe className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Model Name</label>
            <input 
                type="text" 
                value={localSettings.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                placeholder="e.g. gpt-4-turbo"
            />
            <p className="text-xs text-zinc-500">
                Current default: <span className="text-zinc-400 font-mono">{PROVIDERS.find(p => p.id === localSettings.provider)?.defaultModel}</span>
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex justify-between">
                <span>API Key</span>
                {localSettings.provider === 'gemini' && (
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Optional if configured in .env</span>
                )}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Key className="w-4 h-4 text-zinc-500" />
                </div>
                <input 
                    type="password" 
                    value={localSettings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    className="w-full pl-10 bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 placeholder-zinc-600"
                    placeholder={`Enter your ${localSettings.provider} API key`}
                />
            </div>
            <p className="text-[10px] text-zinc-500">
                Your key is stored locally in your browser and sent directly to the API provider.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-white/5 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
            </Button>
        </div>
      </div>
    </div>
  );
};
