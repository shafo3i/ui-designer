
<div align="center">
  
  ![UI Designer Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

  # Gemini UI Designer

  <p align="center">
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://ai.google.dev/">
      <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google-gemini&logoColor=white" alt="Gemini AI" />
    </a>
  </p>

  <h3>
    Build modern React components with the power of AI.
  </h3>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#usage">Usage</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## ✨ Features

**UI Designer** isn't just a code generator; it's a collaborative design partner. It creates, refines, and previews React components in real-time.

*   **🎨 AI-Powered Generation**: Describe your UI implementing Google's Gemini models to generate production-ready React + Tailwind CSS code.
*   **⚡ Live Preview**: Instantly render and interact with generated components in a secure, isolated sandbox.
*   **💬 Interactive Iteration**: refine designs through natural language. Ask to "make it dark mode", "add a button", or "fix the padding".
*   **📦 Smart Export**: Download your creations as individual `.tsx` files or complete ZIP packages ready for your project.
*   **🔌 Multi-Provider Ready**: Designed with an extensible architecture to support multiple AI providers (Gemini, OpenAI, Anthropic, etc.).

## 🛠️ Tech Stack

Built with a focus on comprehensive modern web standards:

*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **AI**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
*   **Utils**: [Prism React Renderer](https://github.com/FormidableLabs/prism-react-renderer) (Syntax Highlighting), [JSZip](https://stuk.github.io/jszip/)

## 🚀 Getting Started

Follow these steps to run the UI Designer locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ui-designer.git
    cd ui-designer
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
    *(Note: You can also enter the key directly in the app settings UI)*

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```

5.  **Open in Browser**
    Visit `http://localhost:5173` to start designing!

## 💡 Usage

1.  **Enter a Prompt**: In the chat input, describe the UI you want to build (e.g., "A modern pricing table with 3 tiers").
2.  **View & Interact**: The AI will generate the code and render a live preview on the right.
3.  **Refine**: Use the chat to ask for changes (e.g., "Make the pro plan highlighted in purple").
4.  **Inspect Code**: Switch to the "Code" tab to view the underlying React + Tailwind code.
5.  **Export**: Click the Export button to save your component.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by Developers for Developers</p>
</div>
