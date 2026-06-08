import { LLMProvider } from '../../core/ports/LLMProvider';
import { ContextManager } from '../../core/ports/ContextManager';
import { FileSystem } from '../../core/ports/FileSystem';
import { WorkspaceScanner } from '../../core/ports/WorkspaceScanner';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Security: Whitelist of allowed commands
const ALLOWED_COMMANDS = new Set([
  'npm', 'npx', 'yarn', 'pnpm',
  'node', 'tsc', 'jest',
  'ls', 'cat', 'pwd', 'echo', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv', 'touch',
  'git'
]);

// Security: Check for shell meta-characters that could allow command chaining, redirection, etc.
// Exclude basic arguments like -v, --version, but prevent `node -e`, etc.
// Additionally, block newlines (\n, \r) as they can be used to chain commands in exec
const DANGEROUS_CHARS = /[&|;`<>$]/;
const NEWLINE_CHARS = /[\n\r]/;

export function isCommandSecure(command: string): { secure: boolean, reason?: string } {
  if (!command || typeof command !== 'string') return { secure: false, reason: 'Empty command' };

  // Check for dangerous characters
  if (DANGEROUS_CHARS.test(command)) {
    return { secure: false, reason: 'Command contains forbidden shell characters' };
  }

  // Explicitly check for newlines which act as command separators in exec
  if (NEWLINE_CHARS.test(command)) {
    return { secure: false, reason: 'Command contains newlines which can bypass security checks' };
  }

  const parts = command.trim().split(/\s+/);
  const baseCmd = parts[0];

  if (!ALLOWED_COMMANDS.has(baseCmd)) {
    return { secure: false, reason: `Command '${baseCmd}' is not allowed` };
  }

  // Prevent running eval with node
  if (baseCmd === 'node' && (parts.includes('-e') || parts.includes('--eval'))) {
    return { secure: false, reason: 'node -e/--eval is not allowed' };
  }

  return { secure: true };
}

export class ChatUseCase {
  private history: string = '';

  constructor(
    private llm: LLMProvider,
    private contextManager: ContextManager,
    private fs: FileSystem,
    private scanner: WorkspaceScanner
  ) {}

  async execute(query: string, onAction?: (action: string) => void): Promise<{ response: string, modifiedFiles: string[] }> {
    const context = await this.contextManager.retrieveContext();
    const projectInfo = await this.scanner.scan(process.cwd());
    const systemPrompt = `You are Pars, a hyper-fast, elite AI coding agent. Maintain a cyber-shamanism, elegant, and highly precise persona.
You have AUTONOMOUS AGENTIC CAPABILITIES. 

Project Type: ${projectInfo.description}
Dependencies: ${projectInfo.dependencies.join(', ')}

Current Workspace Tree:
${projectInfo.tree}

Project Context:
${context}

Before taking any action or generating a final response, you MUST deeply analyze the problem and outline your reasoning inside a <THOUGHT> block. Example:
<THOUGHT>
I need to check the package.json to see if React is installed before writing the component.
</THOUGHT>

If you need to read the content of a file to understand the code, you MUST output EXACTLY this block and nothing else:
<READ>path/to/file.ts</READ>

If you need to rewrite, refactor, or create a file, you MUST output EXACTLY this block:
<WRITE path="path/to/file.ts">
// complete code here
</WRITE>

If you need to execute a terminal command (e.g. to run tests, compile code, or check the system), you MUST output EXACTLY this block:
<BASH>
npm run test
</BASH>

When you output these tags, the system will execute the operation locally and feed the results (or errors) back to you immediately. You can do this as many times as needed to solve the user's request before giving a final human-facing response.`;
    
    // Append the user query to our ongoing session history
    this.history += `\nUser: ${query}\nPars:`;
    let currentPrompt = this.history;
    let finalResponse = '';
    const modifiedFiles = new Set<string>();

    // Safeguards against infinite loops
    let iterationCount = 0;
    const MAX_ITERATIONS = 7;

    // The Agentic Loop
    while (true) {
      iterationCount++;
      if (iterationCount > MAX_ITERATIONS) {
        finalResponse = "System Error: The agentic ritual was forcefully terminated. The spirits became trapped in an infinite loop. Please try again with more specific instructions.";
        this.history = currentPrompt + finalResponse + '\n';
        break;
      }

      const response = await this.llm.ask(systemPrompt, currentPrompt);
      
      const readMatch = response.match(/<READ>\s*(.*?)\s*<\/READ>/);
      if (readMatch) {
        const filePath = readMatch[1];
        if (onAction) onAction(`Reading ${filePath}...`);
        try {
          const content = await this.fs.readFile(filePath);
          currentPrompt += response + `\nSystem: Contents of ${filePath}:\n${content}\nPars:`;
          continue;
        } catch (e: any) {
          currentPrompt += response + `\nSystem: Error reading ${filePath}: ${e.message}\nPars:`;
          continue;
        }
      }

      const writeMatch = response.match(/<WRITE path="(.*?)">\n?([\s\S]*?)<\/WRITE>/);
      if (writeMatch) {
        const filePath = writeMatch[1];
        const newContent = writeMatch[2];
        if (onAction) onAction(`Rewriting ${filePath}...`);
        try {
          await this.fs.writeFile(filePath, newContent);
          modifiedFiles.add(filePath);
          currentPrompt += response + `\nSystem: Successfully saved changes to ${filePath}.\nPars:`;
          continue;
        } catch (e: any) {
          currentPrompt += response + `\nSystem: Error writing to ${filePath}: ${e.message}\nPars:`;
          continue;
        }
      }

      const bashMatch = response.match(/<BASH>\n?([\s\S]*?)<\/BASH>/);
      if (bashMatch) {
        const command = bashMatch[1].trim();

        const securityCheck = isCommandSecure(command);
        if (!securityCheck.secure) {
          if (onAction) onAction(`Blocked insecure command: ${command}`);
          currentPrompt += response + `\nSystem: Command execution blocked for security reasons: ${securityCheck.reason}.\nPars:`;
          continue;
        }

        if (onAction) onAction(`Executing bash command: ${command}`);
        try {
          // Timeout set to 15 seconds to prevent freezing on long-running tasks like "npm start"
          const { stdout, stderr } = await execAsync(command, { cwd: process.cwd(), timeout: 15000 });
          currentPrompt += response + `\nSystem: Command executed successfully.\n[STDOUT]:\n${stdout}\n[STDERR]:\n${stderr}\nPars:`;
          continue;
        } catch (e: any) {
          const isTimeout = e.killed && e.signal === 'SIGTERM';
          const errorMsg = isTimeout ? 'Command timed out after 15 seconds. Do NOT run blocking server commands.' : e.message;
          currentPrompt += response + `\nSystem: Command failed.\n[STDOUT]:\n${e.stdout || ''}\n[STDERR]:\n${e.stderr || ''}\n[ERROR]:\n${errorMsg}\nPars:`;
          continue;
        }
      }

      // Strip out the THOUGHT tags from the final user-facing response to keep the UI clean
      finalResponse = response.replace(/<THOUGHT>[\s\S]*?<\/THOUGHT>/g, '').trim();
      
      // If the response is empty after stripping thoughts, they forgot to provide a final answer!
      if (!finalResponse) {
         currentPrompt += response + `\nSystem: You only provided a <THOUGHT> block. You must provide a human-facing response or an action tag (<READ>, <WRITE>, <BASH>).\nPars:`;
         continue;
      }

      this.history = currentPrompt + response + '\n';
      break;
    }
    
    return { response: finalResponse, modifiedFiles: Array.from(modifiedFiles) };
  }
}
