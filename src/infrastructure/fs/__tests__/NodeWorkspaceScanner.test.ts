import { NodeWorkspaceScanner } from '../NodeWorkspaceScanner';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('NodeWorkspaceScanner', () => {
  let scanner: NodeWorkspaceScanner;
  let tempDir: string;

  beforeEach(async () => {
    scanner = new NodeWorkspaceScanner();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pars-scanner-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should return empty dependencies and "Generic Workspace" description when package.json is missing', async () => {
    // We intentionally do not create a package.json in tempDir

    // Create some dummy files just to test the tree structure
    await fs.writeFile(path.join(tempDir, 'dummy.txt'), 'hello world');

    const result = await scanner.scan(tempDir);

    expect(result.dependencies).toEqual([]);
    expect(result.description).toBe('Generic Workspace');
    expect(result.tree).toContain('├── dummy.txt\n');
  });

  it('should extract dependencies and return "Node.js/TypeScript Project" when package.json is present', async () => {
    const packageJson = {
      name: 'test-project',
      dependencies: {
        'react': '18.2.0'
      },
      devDependencies: {
        'typescript': '5.0.0'
      }
    };

    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const result = await scanner.scan(tempDir);

    expect(result.dependencies).toEqual(['react: 18.2.0', 'typescript: 5.0.0']);
    expect(result.description).toBe('Node.js/TypeScript Project');
    expect(result.tree).toContain('├── package.json\n');
  });
});
