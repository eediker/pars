import { LocalFileSystem } from '../LocalFileSystem';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('LocalFileSystem', () => {
  let fileSystem: LocalFileSystem;
  let tempDir: string;

  beforeEach(async () => {
    fileSystem = new LocalFileSystem();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pars-localfs-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('readFile', () => {
    it('should read file content as utf-8 string', async () => {
      const testFilePath = path.join(tempDir, 'test-read.txt');
      const testContent = 'hello local file system';
      await fs.writeFile(testFilePath, testContent, 'utf-8');

      const result = await fileSystem.readFile(testFilePath);
      expect(result).toBe(testContent);
    });

    it('should throw an error if the file does not exist', async () => {
      const testFilePath = path.join(tempDir, 'non-existent.txt');
      await expect(fileSystem.readFile(testFilePath)).rejects.toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write data to a new file and create directories recursively', async () => {
      const nestedFilePath = path.join(tempDir, 'nested', 'dir', 'test-write.txt');
      const testContent = 'written content';

      await fileSystem.writeFile(nestedFilePath, testContent);

      const actualContent = await fs.readFile(nestedFilePath, 'utf-8');
      expect(actualContent).toBe(testContent);
    });

    it('should overwrite existing file', async () => {
      const testFilePath = path.join(tempDir, 'test-overwrite.txt');
      await fs.writeFile(testFilePath, 'initial content', 'utf-8');

      const testContent = 'overwritten content';
      await fileSystem.writeFile(testFilePath, testContent);

      const actualContent = await fs.readFile(testFilePath, 'utf-8');
      expect(actualContent).toBe(testContent);
    });
  });

  describe('listDirectory', () => {
    it('should list files and directories in a given path', async () => {
      await fs.writeFile(path.join(tempDir, 'file1.txt'), 'test', 'utf-8');
      await fs.writeFile(path.join(tempDir, 'file2.txt'), 'test', 'utf-8');
      await fs.mkdir(path.join(tempDir, 'dir1'));

      const result = await fileSystem.listDirectory(tempDir);
      expect(result).toHaveLength(3);
      expect(result).toContain('file1.txt');
      expect(result).toContain('file2.txt');
      expect(result).toContain('dir1');
    });

    it('should throw an error if directory does not exist', async () => {
      const nonExistentDir = path.join(tempDir, 'non-existent-dir');
      await expect(fileSystem.listDirectory(nonExistentDir)).rejects.toThrow();
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const testFilePath = path.join(tempDir, 'test-exists.txt');
      await fs.writeFile(testFilePath, 'test', 'utf-8');

      const result = await fileSystem.fileExists(testFilePath);
      expect(result).toBe(true);
    });

    it('should return true if directory exists', async () => {
      const testDirPath = path.join(tempDir, 'test-exists-dir');
      await fs.mkdir(testDirPath);

      const result = await fileSystem.fileExists(testDirPath);
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const nonExistentFilePath = path.join(tempDir, 'non-existent.txt');

      const result = await fileSystem.fileExists(nonExistentFilePath);
      expect(result).toBe(false);
    });
  });
});
