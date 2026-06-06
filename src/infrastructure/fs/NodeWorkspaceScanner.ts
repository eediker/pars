import { promises as fs, Dirent } from 'fs';
import * as path from 'path';
import { WorkspaceScanner, ProjectInfo } from '../../core/ports/WorkspaceScanner';

class Semaphore {
  private tasks: (() => void)[] = [];
  private activeCount: number = 0;

  constructor(private concurrency: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.concurrency) {
      await new Promise<void>((resolve) => this.tasks.push(resolve));
    }

    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      if (this.tasks.length > 0) {
        const next = this.tasks.shift();
        if (next) next();
      }
    }
  }
}

export class NodeWorkspaceScanner implements WorkspaceScanner {
  private semaphore = new Semaphore(100);

  async scan(dirPath: string): Promise<ProjectInfo> {
    const tree = await this.buildTree(dirPath);
    const deps = await this.extractDependencies(dirPath);

    return {
      tree,
      dependencies: deps,
      description: deps.length > 0 ? 'Node.js/TypeScript Project' : 'Generic Workspace',
    };
  }

  private async extractDependencies(dirPath: string): Promise<string[]> {
    try {
      const packageJsonPath = path.join(dirPath, 'package.json');
      const data = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(data);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.entries(allDeps).map(([name, version]) => `${name}: ${version}`);
    } catch {
      return [];
    }
  }

  private async buildTree(dirPath: string, prefix: string = '', depth: number = 0): Promise<string> {
    if (depth > 4) return ''; // limit recursion
    try {
      const dirents: Dirent[] = await this.semaphore.run(() => fs.readdir(dirPath, { withFileTypes: true }));
      const validDirents = dirents.filter((dirent: Dirent) =>
        !['node_modules', '.git', 'dist', '.pars', 'build', 'resources', '.DS_Store'].includes(dirent.name)
      );

      const parts = await Promise.all(
        validDirents.map(async (dirent: Dirent) => {
          let part = `${prefix}├── ${dirent.name}\n`;
          if (dirent.isDirectory()) {
            part += await this.buildTree(path.join(dirPath, dirent.name), prefix + '│   ', depth + 1);
          }
          return part;
        })
      );

      return parts.join('');
    } catch {
      return '';
    }
  }
}
