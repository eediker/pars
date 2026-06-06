import { LLMProvider } from '../../core/ports/LLMProvider';
import { ContextManager } from '../../core/ports/ContextManager';
import { FileSystem } from '../../core/ports/FileSystem';
import { WorkspaceScanner } from '../../core/ports/WorkspaceScanner';

export class AskUseCase {
  constructor(
    private llm: LLMProvider,
    private contextManager: ContextManager,
    private fs: FileSystem,
    private scanner: WorkspaceScanner
  ) {}

  async execute(query: string): Promise<string> {
    const context = await this.contextManager.retrieveContext();
    const projectInfo = await this.scanner.scan(process.cwd());
    const systemPrompt = `You are Pars, a hyper-fast AI coding assistant. Answer the user's query clearly and concisely.

Project Type: ${projectInfo.description}
Dependencies: ${projectInfo.dependencies.join(', ')}

Current Workspace Tree:
${projectInfo.tree}\n\nProject Context:\n${context}`;
    
    return this.llm.ask(systemPrompt, query);
  }
}
