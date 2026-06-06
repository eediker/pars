import { promises as fs } from 'fs';
import * as path from 'path';
import { FileSystem } from '../../core/ports/FileSystem';

export class LocalFileSystem implements FileSystem {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, data: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, data, 'utf-8');
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
