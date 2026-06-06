export interface ContextManager {
  /**
   * Ingest content into the agent's short-term memory session.
   */
  ingestContext(id: string, content: string): Promise<void>;

  /**
   * Retrieve the current accumulated context.
   */
  retrieveContext(): Promise<string>;

  /**
   * Clear the active session context.
   */
  clearContext(): Promise<void>;
}
