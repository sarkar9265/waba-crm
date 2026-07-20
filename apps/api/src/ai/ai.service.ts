import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates a reply to an incoming message based on the client's system prompt.
   */
  async generateReply(messageText: string, systemPrompt: string): Promise<string> {
    this.logger.log(`Generating AI reply...`);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageText },
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || 'I am unable to process that right now.';
    } catch (error) {
      this.logger.error('Failed to generate AI reply', error);
      throw error;
    }
  }
}
