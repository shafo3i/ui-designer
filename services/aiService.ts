
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedComponent, AISettings, AIProvider } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
You are an expert Senior Frontend Engineer and UI/UX Designer specializing in React, Next.js, and Tailwind CSS.
Your task is to generate high-quality, responsive, and accessible UI components based on user prompts.

You must strictly return a JSON object with the following properties:
1. 'name': A short, descriptive name for the component.
2. 'description': A brief explanation of the design choices.
3. 'code': The clean, copy-paste ready TypeScript/React code (using 'import' statements).
4. 'previewHtml': A standalone HTML string for the live preview.

CRITICAL 'previewHtml' REQUIREMENTS:
- It must be a completely standalone HTML string.
- Include Tailwind CSS CDN.
- Include React and ReactDOM UMD scripts (v18+).
- Include Babel Standalone script.
- Define the generated component inside a <script type="text/babel"> tag.
- Use 'const { useState, useEffect, useRef } = React;' to destructure hooks.
- Use 'lucide-react' icons if needed (load via unpkg).
- Mount the component to 'document.getElementById("root")'.
- Ensure the component is rendered at the end of the script.
`;

// Helper to sanitize JSON from potential markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- Gemini Implementation ---
const generateGemini = async (prompt: string, settings: AISettings): Promise<Omit<GeneratedComponent, 'id' | 'timestamp'>> => {
  // Use env key if user key is empty, otherwise use user key
  const apiKey = settings.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing for Gemini");

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: settings.model || 'gemini-2.5-flash', // Default to flash if empty
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          code: { type: Type.STRING },
          previewHtml: { type: Type.STRING }
        },
        required: ["name", "description", "code", "previewHtml"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text);
};

// --- OpenAI Compatible Implementation (OpenAI, DeepSeek, XAI) ---
const generateOpenAICompatible = async (prompt: string, settings: AISettings): Promise<Omit<GeneratedComponent, 'id' | 'timestamp'>> => {
  if (!settings.apiKey) throw new Error(`API Key is missing for ${settings.provider}`);

  let baseUrl = settings.baseUrl;
  if (!baseUrl) {
    switch (settings.provider) {
      case 'openai': baseUrl = 'https://api.openai.com/v1'; break;
      case 'deepseek': baseUrl = 'https://api.deepseek.com'; break;
      case 'xai': baseUrl = 'https://api.x.ai/v1'; break;
      default: baseUrl = 'https://api.openai.com/v1';
    }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION_BASE + "\nIMPORTANT: RETURN ONLY RAW JSON." },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("No content received");

  return JSON.parse(cleanJson(content));
};

// --- Anthropic Implementation ---
const generateAnthropic = async (prompt: string, settings: AISettings): Promise<Omit<GeneratedComponent, 'id' | 'timestamp'>> => {
  if (!settings.apiKey) throw new Error("API Key is missing for Anthropic");

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true' // Required for client-side calls
    },
    body: JSON.stringify({
      model: settings.model || 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      system: SYSTEM_INSTRUCTION_BASE + "\nIMPORTANT: RETURN ONLY RAW JSON. NO MARKDOWN.",
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  if (!content) throw new Error("No content received");

  return JSON.parse(cleanJson(content));
};

// --- Main Factory Function ---
export const generateUIComponent = async (prompt: string, settings: AISettings): Promise<Omit<GeneratedComponent, 'id' | 'timestamp'>> => {
  switch (settings.provider) {
    case 'gemini':
      return generateGemini(prompt, settings);
    case 'openai':
    case 'deepseek':
    case 'xai':
      return generateOpenAICompatible(prompt, settings);
    case 'anthropic':
      return generateAnthropic(prompt, settings);
    default:
      throw new Error(`Unsupported provider: ${settings.provider}`);
  }
};
