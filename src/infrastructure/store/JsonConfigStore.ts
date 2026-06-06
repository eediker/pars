import * as path from 'path';
import * as os from 'os';
import { promises as fs } from 'fs';
import { ConfigStore } from '../../core/ports/ConfigStore';

export class JsonConfigStore implements ConfigStore {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.pars', 'config.json');
  }

  private async ensureConfig(): Promise<Record<string, string>> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async saveConfig(key: string, value: string): Promise<void> {
    const config = await this.ensureConfig();
    config[key] = value;
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  async getConfig(key: string): Promise<string | null> {
    const config = await this.ensureConfig();
    return config[key] || null;
  }
}
