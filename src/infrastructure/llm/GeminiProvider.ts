import { GoogleGenAI } from '@google/genai';
import { LLMProvider } from '../../core/ports/LLMProvider';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      }
    });

    return response.text || '';
  }

  async refactor(code: string, instructions: string): Promise<string> {
    const systemPrompt = `You are an elite system architect and senior developer. Your task is to refactor the provided code according to the instructions. Return ONLY the newly refactored code without any markdown block quotes (like \`\`\`typescript), explanations, or conversational text.`;
    const userPrompt = `Instructions:\n${instructions}\n\nCode to refactor:\n${code}`;
    
    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      }
    });

    return response.text || '';
  }
}
