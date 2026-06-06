import { ConfigStore } from '../../core/ports/ConfigStore';

export class ConfigUseCase {
  constructor(private store: ConfigStore) {}

  async setApiKey(provider: string, key: string): Promise<void> {
    await this.store.saveConfig(`${provider.toUpperCase()}_API_KEY`, key);
    await this.store.saveConfig('ACTIVE_PROVIDER', provider.toLowerCase());
  }

  async getApiKey(provider: string): Promise<string | null> {
    return this.store.getConfig(`${provider.toUpperCase()}_API_KEY`);
  }

  async getActiveProvider(): Promise<string> {
    const active = await this.store.getConfig('ACTIVE_PROVIDER');
    return active || 'gemini'; // Default to gemini if not set
  }
}
