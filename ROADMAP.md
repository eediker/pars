# Pars: The Path to the Ultimate AI Coding Agent

This roadmap outlines the strategic phases to evolve Pars from a hyper-fast CLI script into a fully autonomous, context-aware, and agentic workspace assistant. 

Because we built Pars using **Clean/Onion Architecture**, we can add complex features and even entirely new User Interfaces without ever breaking the core logic.

---

## Phase 1: Seamless Developer Experience (DX)

*Status: Next Up*

The goal of this phase is to make Pars frictionless to use throughout the daily workflow.

1. **Global Installation & Bin Linking**
   - **Goal:** Allow the user to type `pars` from any directory on their OS.
   - **Implementation:** Utilize the `"bin"` property already in `package.json` and run `npm link`. 
2. **Interactive Chat Mode (`pars chat`)**
   - **Goal:** Stop forcing the user to type `pars ask` over and over. Open a persistent chat loop.
   - **Implementation:** Use `@clack/prompts` or `inquirer` to create a continuous terminal loop. The `ContextManager` will hold the ongoing conversation history (not just file data).
3. **Beautiful Markdown Rendering**
   - **Goal:** Render LLM code blocks in the terminal with proper syntax highlighting.
   - **Implementation:** Integrate `marked` and `cli-highlight` so that code snippets look exactly like they do in VS Code.

---

## Phase 2: Advanced Workspace Intelligence

*Status: Planned*

Right now, Pars only knows what you explicitly tell it to `read`. In this phase, Pars will learn to "see" the entire project automatically.

1. **Auto-Discovery (Directory Mapping)**
   - **Goal:** When Pars boots up, it automatically maps the directory structure and package dependencies.
   - **Implementation:** Create a `WorkspaceScanner` infrastructure adapter that builds a fast tree of the project and passes it into the LLM system prompt.
2. **Local Vector Database (RAG)**
   - **Goal:** Allow Pars to search through a massive monorepo instantly.
   - **Implementation:** Integrate a lightweight local vector store (e.g., `ChromaDB` running locally, or `sqlite-vss`). Pars will chunk your codebase, generate embeddings, and retrieve only the relevant files when you ask complex architectural questions.

---

## Phase 3: Autonomous Agentic Execution

*Status: Long-term Vision*

This is where Pars becomes a true "Agent" rather than just an "Assistant."

1. **Tool Use (Bash Execution)**
   - **Goal:** Give Pars the ability to run terminal commands.
   - **Implementation:** If you say, "Fix the tests," Pars will run `npm test`, read the error output, modify the code, and re-run the tests until they pass.
2. **Auto-Git Integration**
   - **Goal:** Never write a commit message again.
   - **Implementation:** Hook into `simple-git`. When `pars refactor` is run, Pars will automatically stash your current work, create a new branch, apply the refactor, and generate a beautiful semantic commit message.

---

## Phase 4: Beyond the Terminal (Multi-Platform)

*Status: Endgame*

Because we strictly isolated our Presentation layer (`src/presentation/cli`), we can strip it away and plug the core `UseCases` into a visual app.

1. **Tauri Desktop Application**
   - **Goal:** Build a sleek, transparent, floating desktop widget with the "cyber-shamanism" aesthetic.
   - **Implementation:** Initialize a Tauri (Rust + React/Solid) project. Inject the exact same TypeScript `app/usecases` into the webview. Pars will sit transparently on your screen, watching your clipboard or active IDE file.
2. **VS Code / Cursor Extension**
   - **Goal:** Embed Pars directly into the editor context.
   - **Implementation:** Wrap the core domain logic in a VS Code Extension host wrapper.
