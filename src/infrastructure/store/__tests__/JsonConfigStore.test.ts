import * as path from 'path';
import * as os from 'os';
import { promises as fs } from 'fs';
import { JsonConfigStore } from '../JsonConfigStore';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('os', () => ({
  homedir: jest.fn(),
}));

describe('JsonConfigStore', () => {
  const mockHomeDir = '/mock/home';
  const expectedConfigPath = path.join(mockHomeDir, '.pars', 'config.json');

  beforeEach(() => {
    jest.resetAllMocks();
    (os.homedir as jest.Mock).mockReturnValue(mockHomeDir);
  });

  describe('getConfig', () => {
    it('should return value when config file exists and key is present', async () => {
      const mockData = JSON.stringify({ testKey: 'testValue' });
      (fs.readFile as jest.Mock).mockResolvedValue(mockData);

      const store = new JsonConfigStore();
      const result = await store.getConfig('testKey');

      expect(result).toBe('testValue');
      expect(fs.readFile).toHaveBeenCalledWith(expectedConfigPath, 'utf-8');
    });

    it('should return null when config file exists but key is not present', async () => {
      const mockData = JSON.stringify({ otherKey: 'otherValue' });
      (fs.readFile as jest.Mock).mockResolvedValue(mockData);

      const store = new JsonConfigStore();
      const result = await store.getConfig('testKey');

      expect(result).toBeNull();
    });

    it('should return null (empty object) when fs.readFile throws an error (e.g. file missing)', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const store = new JsonConfigStore();
      const result = await store.getConfig('testKey');

      expect(result).toBeNull();
      expect(fs.readFile).toHaveBeenCalledWith(expectedConfigPath, 'utf-8');
    });

    it('should use cache after first read', async () => {
      const mockData = JSON.stringify({ testKey: 'testValue' });
      (fs.readFile as jest.Mock).mockResolvedValueOnce(mockData);

      const store = new JsonConfigStore();
      await store.getConfig('testKey');
      const result2 = await store.getConfig('testKey');

      expect(result2).toBe('testValue');
      expect(fs.readFile).toHaveBeenCalledTimes(1); // Should only be read once
    });
  });

  describe('saveConfig', () => {
    it('should save new key-value pair and create directory if necessary', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const store = new JsonConfigStore();
      await store.saveConfig('newKey', 'newValue');

      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(expectedConfigPath), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedConfigPath,
        JSON.stringify({ newKey: 'newValue' }, null, 2),
        'utf-8'
      );
    });

    it('should update existing config and preserve other keys', async () => {
      const mockData = JSON.stringify({ existingKey: 'existingValue' });
      (fs.readFile as jest.Mock).mockResolvedValue(mockData);

      const store = new JsonConfigStore();
      await store.saveConfig('newKey', 'newValue');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expectedConfigPath,
        JSON.stringify({ existingKey: 'existingValue', newKey: 'newValue' }, null, 2),
        'utf-8'
      );
    });
  });
});
