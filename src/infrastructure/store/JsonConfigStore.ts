import * as path from 'path';
import * as os from 'os';
import { promises as fs } from 'fs';
import { ConfigStore } from '../../core/ports/ConfigStore';

export class JsonConfigStore implements ConfigStore {
  private configPath: string;
  private configCache: Record<string, string> | null = null;

  constructor() {
    this.configPath = path.join(os.homedir(), '.pars', 'config.json');
  }

  private async ensureConfig(): Promise<Record<string, string>> {
    if (this.configCache !== null) {
      return this.configCache;
    }

    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.configCache = JSON.parse(data);
    } catch {
      this.configCache = {};
    }

    return this.configCache as Record<string, string>;
  }

  async saveConfig(key: string, value: string): Promise<void> {
    const config = await this.ensureConfig();
    config[key] = value;
    this.configCache = config;
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  async getConfig(key: string): Promise<string | null> {
    const config = await this.ensureConfig();
    return config[key] || null;
  }
}
