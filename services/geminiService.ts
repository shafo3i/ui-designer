import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedComponent } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Senior Frontend Engineer and UI/UX Designer specializing in React, Next.js, and Tailwind CSS.
Your task is to generate high-quality, responsive, and accessible UI components based on user prompts.

When a user requests a UI component, you must return a JSON object strictly conforming to the schema provided.

The 'previewHtml' field is CRITICAL. It must be a completely standalone HTML string that can run in an iframe without any external build steps. It must:
1. Include the Tailwind CSS CDN script.
2. Include React and ReactDOM UMD scripts (version 18+).
3. Include Babel Standalone script to parse JSX.
4. Define the generated component inside a <script type="text/babel"> tag.
5. Use 'const { useState, useEffect, useRef } = React;' to destructure hooks.
6. Use 'lucide-react' icons if needed (load via unpkg or simulate with SVGs if unpkg is unreliable, prefer inline SVGs for stability in preview).
7. Mount the component to 'document.getElementById("root")'.
8. The component inside 'previewHtml' should use 'export default function App() { ... }' or similar, but ensure it is rendered at the end of the script.

The 'code' field should be the clean, copy-paste ready TypeScript/React code for a Next.js or Create React App project (using 'import' statements, not 'const { ... } = React').
`;

export const generateUIComponent = async (prompt: string): Promise<Omit<GeneratedComponent, 'id' | 'timestamp'>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A short, descriptive name for the component" },
            description: { type: Type.STRING, description: "A brief explanation of the design choices" },
            code: { type: Type.STRING, description: "The clean React/TypeScript code for the user to copy" },
            previewHtml: { type: Type.STRING, description: "The standalone HTML string for the live preview iframe" }
          },
          required: ["name", "description", "code", "previewHtml"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as Omit<GeneratedComponent, 'id' | 'timestamp'>;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};