import { JsonConfigStore } from '../JsonConfigStore';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

// Mock the modules
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
  let store: JsonConfigStore;
  const mockHomedir = '/mock/homedir';
  const mockConfigPath = path.join(mockHomedir, '.pars', 'config.json');

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set up default mock implementations
    (os.homedir as jest.Mock).mockReturnValue(mockHomedir);

    // Create fresh instance for each test
    store = new JsonConfigStore();
  });

  describe('getConfig', () => {
    it('should return null when config file does not exist', async () => {
      // Setup mock to throw error simulating file not found
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const result = await store.getConfig('someKey');

      expect(fs.readFile).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
      expect(result).toBeNull();
    });

    it('should return value when config file exists and key is present', async () => {
      // Setup mock to return valid JSON
      const mockConfig = { someKey: 'someValue' };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const result = await store.getConfig('someKey');

      expect(fs.readFile).toHaveBeenCalledWith(mockConfigPath, 'utf-8');
      expect(result).toBe('someValue');
    });

    it('should return null when config file exists but key is absent', async () => {
      // Setup mock to return valid JSON
      const mockConfig = { otherKey: 'otherValue' };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      const result = await store.getConfig('someKey');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON in config file by returning null', async () => {
      // Setup mock to return invalid JSON
      (fs.readFile as jest.Mock).mockResolvedValue('invalid-json');

      const result = await store.getConfig('someKey');

      expect(result).toBeNull();
    });

    it('should use cached config on subsequent calls', async () => {
      // Setup mock to return valid JSON
      const mockConfig = { someKey: 'someValue' };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockConfig));

      // First call reads the file
      await store.getConfig('someKey');
      expect(fs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await store.getConfig('someKey');
      expect(fs.readFile).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('saveConfig', () => {
    it('should create directory, save value and update cache', async () => {
      // Initial read will fail (file doesn't exist)
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await store.saveConfig('newKey', 'newValue');

      // Verify directory creation
      expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(mockConfigPath), { recursive: true });

      // Verify file writing
      const expectedConfig = { newKey: 'newValue' };
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(expectedConfig, null, 2),
        'utf-8'
      );

      // Verify cache is updated by calling getConfig (should not read file)
      jest.clearAllMocks(); // Clear read/write mocks
      const result = await store.getConfig('newKey');
      expect(result).toBe('newValue');
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should update existing config', async () => {
      // Initial read returns existing config
      const existingConfig = { existingKey: 'existingValue' };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingConfig));

      await store.saveConfig('newKey', 'newValue');

      // Verify file writing includes existing and new keys
      const expectedConfig = { existingKey: 'existingValue', newKey: 'newValue' };
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(expectedConfig, null, 2),
        'utf-8'
      );
    });
  });
});
