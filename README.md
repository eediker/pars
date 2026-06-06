<div align="center">
  <img src="resources/parslogo.png" alt="Pars Logo" width="400" />

  # Pars (Anatolian Leopard)
  **A hyper-fast, modular, and autonomous AI code agent built for the terminal and desktop.**

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
</div>

---

## ⚡ What is Pars?

**Pars** is a cutting-edge AI coding assistant designed to bring the power of elite LLMs directly into your local workspace. Built strictly adhering to **Clean/Onion Architecture**, it is fiercely modular, insanely fast (bundled via esbuild to execute in milliseconds), and capable of autonomous agentic loops.

Wrapped in a sleek *Cyber-Shamanism* aesthetic, Pars is designed to feel like an extension of your own mind. It features a blazing fast CLI and a beautiful native Desktop application.

## 🚀 Core Features

- **Hyper-Fast Execution**: CLI compiled with esbuild, achieving sub-100ms startup times.
- **Native Desktop GUI**: Includes a beautifully crafted desktop application built with Tauri, React, and Vite, providing a seamless visual interface.
- **Agentic Autonomy**: Pars doesn't just give advice; it can autonomously `READ` files, `WRITE` refactors, and execute tasks directly on your system.
- **Workspace Intelligence**: Automatically scans your directory tree and dependencies, injecting full project awareness into the LLM context.
- **Provider Agnostic**: Native support for **Groq** (Llama-3), **OpenAI**, and **Gemini**.
- **Interactive Chat Ritual**: A continuous, stateful terminal loop powered by `@clack/prompts` and real-time Markdown syntax highlighting.

## 🛠️ Installation

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm
- Rust (required for building the Tauri Desktop App)

### Building the Project

Clone the repository and link the binary globally to use `pars` anywhere on your machine:

```bash
git clone https://github.com/your-username/pars.git
cd pars

# Install CLI dependencies
npm install

# Build the CLI
npm run build

# Link the CLI globally
npm link
```

### Desktop UI Dependencies

If you plan to use the Desktop UI, make sure to install its dependencies as well:

```bash
cd desktop
npm install
```

## 🔮 Usage

### Initial Setup
Bind your desired LLM provider (e.g., Groq for blazing fast inference):

```bash
pars config groq YOUR_API_KEY
```
*(Supported providers: `groq`, `openai`, `gemini`)*

### Desktop GUI
Open the Pars Desktop GUI directly in your current workspace:

```bash
pars ui
# or use the shorthand:
pars .
```
*(Note: The first invocation will compile the Rust backend for Tauri, which may take a minute.)*

### CLI Commands

Enter the interactive, autonomous chat loop:
```bash
pars chat
```

Or run single-shot commands:
```bash
# Ask a quick question
pars ask "How does the caching layer work here?"

# Ingest a specific file into context
pars read src/utils.ts

# Automatically refactor a file
pars refactor src/utils.ts -i "Add strict types"
```

### Daemon Mode
You can start the Pars daemon server independently for the Desktop GUI to connect to:
```bash
pars serve -p 3333
```

## 🏛️ Architecture

Pars enforces strict separation of concerns, allowing it to easily be ported to a desktop widget or VS Code extension:
- **Core Domain**: Holds pure TypeScript Use Cases and abstract Ports (Interfaces).
- **Infrastructure**: The physical layer (Local File System adapters, Node.js Scanners, Groq/OpenAI/Gemini APIs).
- **Presentation**:
  - **CLI Layer**: Commander, Clack Prompts, Spinners.
  - **Desktop GUI**: Tauri, React, Vite.
