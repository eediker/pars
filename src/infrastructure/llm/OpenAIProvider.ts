import OpenAI from 'openai';
import { LLMProvider } from '../../core/ports/LLMProvider';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Low temp for more deterministic code logic
    });

    return response.choices[0]?.message?.content || '';
  }

  async refactor(code: string, instructions: string): Promise<string> {
    const systemPrompt = `You are an elite system architect and senior developer. Your task is to refactor the provided code according to the instructions. Return ONLY the newly refactored code without any markdown block quotes (like \`\`\`typescript), explanations, or conversational text.`;
    
    const userPrompt = `Instructions:\n${instructions}\n\nCode to refactor:\n${code}`;
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    return response.choices[0]?.message?.content || '';
  }
}
