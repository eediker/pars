export interface FileSystem {
  /**
   * Reads a file and returns its content as a string.
   */
  readFile(path: string): Promise<string>;

  /**
   * Writes content to a file.
   */
  writeFile(path: string, data: string): Promise<void>;

  /**
   * Lists all files in a given directory.
   */
  listDirectory(path: string): Promise<string[]>;

  /**
   * Checks if a file or directory exists.
   */
  fileExists(path: string): Promise<boolean>;
}
