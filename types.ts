
export interface GeneratedComponent {
  id: string;
  name: string;
  description: string;
  code: string;
  previewHtml: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  component?: GeneratedComponent;
  timestamp: number;
}

export enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
}

export type AIProvider = 'gemini' | 'openai' | 'deepseek' | 'anthropic' | 'xai';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string; // For custom endpoints (optional)
}

export const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: '', // User must provide or use env
  model: 'gemini-2.5-flash',
};
