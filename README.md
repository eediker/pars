<div align="center">
  <img src="resources/parslogo.png" alt="Pars Logo" width="400" />

  # Pars (Anatolian Leopard)
  **A hyper-fast, modular, and autonomous AI code agent built for the terminal.**

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
</div>

---

## ⚡ What is Pars?

**Pars** is a cutting-edge CLI agent designed to bring the power of elite LLMs directly into your local workspace. Built strictly adhering to **Clean/Onion Architecture**, it is fiercely modular, insanely fast (bundled via esbuild to execute in milliseconds), and capable of autonomous agentic loops.

Wrapped in a sleek *Cyber-Shamanism* aesthetic, Pars is designed to feel like an extension of your own mind.

## 🚀 Core Features

- **Hyper-Fast Execution**: Compiled with esbuild, achieving sub-100ms startup times.
- **Agentic Autonomy**: Pars doesn't just give advice; it can autonomously `READ` files, `WRITE` refactors, and execute `BASH` commands directly on your system.
- **Workspace Intelligence**: Automatically scans your directory tree and dependencies, injecting full project awareness into the LLM context.
- **Provider Agnostic**: Native support for **Groq** (Llama-3), **OpenAI**, and **Gemini**.
- **Interactive Chat Ritual**: A continuous, stateful terminal loop powered by `@clack/prompts` and real-time Markdown syntax highlighting.

## 🛠️ Installation

Clone the repository and link the binary globally to use `pars` anywhere on your machine:

```bash
npm install
npm run build
npm link
```

## 🔮 Usage

Bind your desired LLM provider (e.g., Groq for blazing fast inference):

```bash
pars config groq YOUR_API_KEY
```

Enter the interactive, autonomous chat loop:

```bash
pars chat
```

Or run single-shot commands:

```bash
pars ask "How does the caching layer work here?"
pars read src/utils.ts
pars refactor src/utils.ts -i "Add strict types"
```

## 🏛️ Architecture

Pars enforces strict separation of concerns:
- `Core Domain`: Holds pure TypeScript Use Cases and abstract Ports (Interfaces).
- `Infrastructure`: The physical layer (Local File System adapters, Node.js Scanners, Groq APIs).
- `Presentation`: The CLI layer (Commander, Clack Prompts, Spinners).

Because of this isolation, Pars can easily be ported to a desktop widget or VS Code extension in the future.
