<div align="center">
  <img src="resources/parslogo.png" alt="Pars Logo" width="400" />

  # Pars (Anatolian Leopard)
  **A hyper-fast, minimalist, and autonomous AI code agent built for the terminal and desktop.**

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
</div>

---

## ⚡ What is Pars?

**Pars** is a sleek, ultra-minimalist AI coding assistant designed to bring the power of elite LLMs directly into your local workspace. Built strictly adhering to the *Antigravity Code Agent* philosophy, it features zero bloat, zero distractions, and pure interaction. 

It acts completely autonomously: it can read files, write refactors, and execute terminal commands natively on your machine using a deeply integrated Chain-of-Thought (CoT) reasoning protocol.

## 🚀 Core Features

- **Agentic Autonomy**: Pars doesn't just give advice; it can autonomously `READ` files, `WRITE` refactors, and `<BASH>` execute scripts directly on your system to test its own code.
- **Deep Reasoning**: Uses mandatory Chain-of-Thought planning (`<THOUGHT>`) before executing actions, preventing infinite loops and syntax errors.
- **Native Desktop App**: A beautifully crafted, floating desktop application built with Tauri and React that natively attaches to your current working directory.
- **Provider Agnostic**: Native support for **Groq** (Llama-3), **OpenAI**, and **Gemini**.

---

## 🛠️ Installation (The Easy Way)

Pars is packaged as a standalone executable. You **do not** need to install Node.js, Rust, or any complex dependencies to use the Desktop app.

### 🐧 Linux
Download the latest `.deb` or `.AppImage` from the [Releases Page](https://github.com/eediker/pars/releases).
To install via terminal:
```bash
wget https://github.com/eediker/pars/releases/download/v1.0.0/pars-desktop_1.0.0_amd64.deb
sudo dpkg -i pars-desktop_1.0.0_amd64.deb
```

### 🪟 Windows
Download the `.msi` or `.exe` installer from the [Releases Page](https://github.com/eediker/pars/releases) and double-click to install.

### 🍎 macOS
Download the `.dmg` from the [Releases Page](https://github.com/eediker/pars/releases), open it, and drag Pars to your Applications folder.

---

## 💻 Developer Installation (From Source)

If you want to use the blazing-fast Terminal CLI or contribute to the codebase, you can build Pars from source.

**Prerequisites:** Node.js (v18+) and Rust.

```bash
git clone https://github.com/eediker/pars.git
cd pars

# Install core CLI dependencies
npm install

# Build the CLI backend
npm run build

# Link the binary globally to your system
npm link
```

*To build the desktop UI, navigate to `cd desktop` and run `npm install` then `npx tauri build`.*

---

## 🔮 Usage

### 1. Bind your API Key
Before summoning the spirits, you must provide Pars with an LLM token (Groq is recommended for maximum execution speed). Open your terminal and run:

```bash
pars config groq YOUR_API_KEY
```
*(Supported providers: `groq`, `openai`, `gemini`)*

### 2. Launch the Desktop App
Navigate to **any project folder** on your computer and simply type:

```bash
pars .
```
Pars will instantly boot up a sleek, borderless native window directly attached to your current workspace context.

### 3. Use the CLI
If you prefer to stay entirely within the terminal, Pars offers a rich interactive console mode:

```bash
# Enter the interactive, autonomous chat loop
pars chat

# Ask a quick one-off question
pars ask "How does the caching layer work here?"

# Automatically refactor a specific file
pars refactor src/utils.ts -i "Optimize this function for speed"
```
