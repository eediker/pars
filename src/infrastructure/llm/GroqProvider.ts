import Groq from 'groq-sdk';
import { LLMProvider } from '../../core/ports/LLMProvider';
import { REFACTOR_SYSTEM_PROMPT } from '../../core/constants/prompts';

export class GroqProvider implements LLMProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    const chatCompletion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }

  async refactor(code: string, instructions: string): Promise<string> {
    const systemPrompt = REFACTOR_SYSTEM_PROMPT;
    const userPrompt = `Instructions:\n${instructions}\n\nCode to refactor:\n${code}`;
    
    const chatCompletion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }
}
