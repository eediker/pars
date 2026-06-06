export interface ProjectInfo {
  tree: string;
  dependencies: string[];
  description: string;
}

export interface WorkspaceScanner {
  /**
   * Scans the project directory and returns structural and dependency intelligence.
   */
  scan(dirPath: string): Promise<ProjectInfo>;
}
