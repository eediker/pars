export interface ConfigStore {
  /**
   * Save a configuration value securely.
   */
  saveConfig(key: string, value: string): Promise<void>;

  /**
   * Retrieve a configuration value.
   */
  getConfig(key: string): Promise<string | null>;
}
