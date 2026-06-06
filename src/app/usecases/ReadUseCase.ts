import { FileSystem } from '../../core/ports/FileSystem';
import { ContextManager } from '../../core/ports/ContextManager';

export class ReadUseCase {
  constructor(
    private fs: FileSystem,
    private contextManager: ContextManager
  ) {}

  async execute(filePath: string): Promise<void> {
    const exists = await this.fs.fileExists(filePath);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = await this.fs.readFile(filePath);
    await this.contextManager.ingestContext(filePath, content);
  }
}
