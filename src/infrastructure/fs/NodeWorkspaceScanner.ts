import { promises as fs } from 'fs';
import * as path from 'path';
import { WorkspaceScanner, ProjectInfo } from '../../core/ports/WorkspaceScanner';

interface CacheEntry {
  mtimeMs: number;
  dependencies: string[];
}

export class NodeWorkspaceScanner implements WorkspaceScanner {
  private depsCache: Map<string, CacheEntry> = new Map();

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
      const stat = await fs.stat(packageJsonPath);
      const cached = this.depsCache.get(packageJsonPath);

      if (cached && cached.mtimeMs === stat.mtimeMs) {
        return cached.dependencies;
      }

      const data = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(data);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const dependencies = Object.entries(allDeps).map(([name, version]) => `${name}: ${version}`);

      this.depsCache.set(packageJsonPath, { mtimeMs: stat.mtimeMs, dependencies });
      return dependencies;
    } catch {
      return [];
    }
  }

  private async buildTree(dirPath: string, prefix: string = '', depth: number = 0): Promise<string> {
    if (depth > 4) return ''; // limit recursion
    let tree = '';
    try {
      const dirents = await fs.readdir(dirPath, { withFileTypes: true });
      for (const dirent of dirents) {
        if (['node_modules', '.git', 'dist', '.pars', 'build', 'resources', '.DS_Store'].includes(dirent.name)) continue;
        tree += `${prefix}├── ${dirent.name}\n`;
        if (dirent.isDirectory()) {
          tree += await this.buildTree(path.join(dirPath, dirent.name), prefix + '│   ', depth + 1);
        }
      }
    } catch {
      // ignore
    }
    return tree;
  }
}
