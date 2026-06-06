# Pars: Architecture & Implementation Plan

## 1. Technology Stack Selection

For **Pars**, we need extreme speed, minimal resources, and a beautiful terminal UI. Since you requested Go/Rust or a compiled TypeScript setup, and `npm`/`node` is readily available on your system, we will proceed with the **Compiled TypeScript** stack:

*   **Language:** **TypeScript**. We will enforce strict typing and build the project using **esbuild** for sub-millisecond bundling. The result will be a single, highly optimized, and minified Node script for lightning-fast startup.
*   **CLI Framework:** **Commander.js**. Lightweight and the industry standard for Node.js CLIs. It will handle the routing (`pars ask`, `pars read`).
*   **Presentation / Aesthetic:** **Ink (React for CLI)** or **Gradient-String + Chalk + Boxen + Ora**. To achieve the "cyber-shamanism" vibe, we will use modern terminal styling libraries. We can render runic motifs using standard UTF-8 characters and dynamic loading spinners to make it feel futuristic, sleek, and premium.

## 2. Directory Structure (Onion Architecture)

This structure ensures the core logic remains completely isolated from the CLI and file system, meaning you could swap the `src/presentation` out for a web server (e.g., Express/Fastify) or a Desktop App framework (Electron/Tauri) with **zero** changes to the business logic.

```text
pars/
├── src/
│   ├── core/                  # CORE DOMAIN (Zero external dependencies)
│   │   ├── domain/            # Entities (Session, Query, RefactorPlan)
│   │   └── ports/             # Interfaces (LLMProvider, FileSystem, Config)
│   ├── app/                   # APPLICATION LAYER (Use Cases)
│   │   └── usecases/          # Business logic (AskUseCase, RefactorUseCase)
│   ├── infrastructure/        # INFRASTRUCTURE LAYER (External Interactions)
│   │   ├── llm/               # OpenAI, Anthropic, or LocalAI API clients
│   │   ├── fs/                # Local OS FileSystem implementation
│   │   └── store/             # SQLite/JSON config storage
│   └── presentation/          # PRESENTATION LAYER
│       └── cli/               # Commander definitions, terminal UI, styling
├── tsconfig.json
├── package.json
└── esbuild.config.js          # For sub-millisecond bundle compilation
```

## 3. Core Interfaces (`src/core/ports/`)

The Core knows *what* it needs to do, but not *how* it's done. These TypeScript interfaces guarantee decoupling.

```typescript
// src/core/ports/LLMProvider.ts
export interface LLMProvider {
    ask(systemPrompt: string, userPrompt: string): Promise<string>;
    refactor(code: string, instructions: string): Promise<string>;
}

// src/core/ports/FileSystem.ts
// If Pars becomes a Web App, this can be swapped with an S3 bucket or Browser LocalStorage.
export interface FileSystem {
    readFile(path: string): Promise<string>;
    writeFile(path: string, data: string): Promise<void>;
    listDirectory(path: string): Promise<string[]>;
    fileExists(path: string): Promise<boolean>;
}

// src/core/ports/ConfigStore.ts
export interface ConfigStore {
    saveConfig(key: string, value: string): Promise<void>;
    getConfig(key: string): Promise<string | null>;
}

// src/core/ports/ContextManager.ts
export interface ContextManager {
    ingestContext(id: string, content: string): Promise<void>;
    retrieveContext(): Promise<string>;
    clearContext(): Promise<void>;
}
```

## 4. Setup Instructions

The initial environment will be bootstrapped with these commands:

```bash
# 1. Initialize npm and typescript
npm init -y
npm install -D typescript @types/node esbuild

# 2. Setup standard presentation and utilities
npm install commander chalk gradient-string boxen ora dotenv

# 3. Create the Onion Architecture directories
mkdir -p src/core/domain src/core/ports
mkdir -p src/app/usecases
mkdir -p src/infrastructure/llm src/infrastructure/fs src/infrastructure/store
mkdir -p src/presentation/cli
```

## 5. Future Extensibility (Desktop/Web)

Because of the `ports` interfaces, moving to a Desktop App or Web Platform in the future is trivial. We would simply add a new folder `src/presentation/web` and inject the exact same `src/app/usecases` into an Express server or Next.js app. The business logic (`app`), AI integration (`llm`), and local file handling (`fs`) remain untouched.
