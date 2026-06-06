import { LLMProvider } from '../../core/ports/LLMProvider';
import { FileSystem } from '../../core/ports/FileSystem';

export class RefactorUseCase {
  constructor(
    private llm: LLMProvider,
    private fs: FileSystem
  ) {}

  async execute(filePath: string, instructions: string): Promise<void> {
    const exists = await this.fs.fileExists(filePath);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    const originalCode = await this.fs.readFile(filePath);
    const refactoredCode = await this.llm.refactor(originalCode, instructions);

    // Save the refactored code back to the file system
    await this.fs.writeFile(filePath, refactoredCode);
  }
}
