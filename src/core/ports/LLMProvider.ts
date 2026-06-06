export interface LLMProvider {
  /**
   * Send a query to the LLM.
   */
  ask(systemPrompt: string, userPrompt: string): Promise<string>;

  /**
   * Request the LLM to refactor given code based on instructions.
   */
  refactor(code: string, instructions: string): Promise<string>;
}
