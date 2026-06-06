import * as path from 'path';
import { FileSystem } from '../../core/ports/FileSystem';
import { ContextManager } from '../../core/ports/ContextManager';

export class FileContextManager implements ContextManager {
  private contextFile = path.join(process.cwd(), '.pars', 'context.json');
  private cachedContext: Record<string, string> | null = null;

  constructor(private fs: FileSystem) {}

  private async readContextFile(): Promise<Record<string, string>> {
    if (this.cachedContext !== null) {
      return this.cachedContext;
    }

    if (await this.fs.fileExists(this.contextFile)) {
      const data = await this.fs.readFile(this.contextFile);
      this.cachedContext = JSON.parse(data);
      return this.cachedContext!;
    }
    this.cachedContext = {};
    return this.cachedContext;
  }

  async ingestContext(id: string, content: string): Promise<void> {
    const contextMap = await this.readContextFile();
    contextMap[id] = content;
    try {
      await this.fs.writeFile(this.contextFile, JSON.stringify(contextMap, null, 2));
    } catch (e) {
      // Invalidate the cache if the write fails so we don't end up with out of sync state
      this.cachedContext = null;
      throw e;
    }
  }

  async retrieveContext(): Promise<string> {
    const contextMap = await this.readContextFile();
    return Object.entries(contextMap)
      .map(([id, content]) => `--- File: ${id} ---\n${content}\n`)
      .join('\n');
  }

  async clearContext(): Promise<void> {
    this.cachedContext = {};
    await this.fs.writeFile(this.contextFile, JSON.stringify({}));
  }
}
