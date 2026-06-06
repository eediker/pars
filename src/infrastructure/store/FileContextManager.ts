import * as path from 'path';
import { FileSystem } from '../../core/ports/FileSystem';
import { ContextManager } from '../../core/ports/ContextManager';

export class FileContextManager implements ContextManager {
  private contextFile = path.join(process.cwd(), '.pars', 'context.json');

  constructor(private fs: FileSystem) {}

  private async readContextFile(): Promise<Record<string, string>> {
    if (await this.fs.fileExists(this.contextFile)) {
      const data = await this.fs.readFile(this.contextFile);
      return JSON.parse(data);
    }
    return {};
  }

  async ingestContext(id: string, content: string): Promise<void> {
    const contextMap = await this.readContextFile();
    contextMap[id] = content;
    await this.fs.writeFile(this.contextFile, JSON.stringify(contextMap, null, 2));
  }

  async retrieveContext(): Promise<string> {
    const contextMap = await this.readContextFile();
    return Object.entries(contextMap)
      .map(([id, content]) => `--- File: ${id} ---\n${content}\n`)
      .join('\n');
  }

  async clearContext(): Promise<void> {
    await this.fs.writeFile(this.contextFile, JSON.stringify({}));
  }
}
