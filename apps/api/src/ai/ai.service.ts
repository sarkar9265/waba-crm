import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates an auto-reply using a system prompt and Knowledge Base context.
   */
  async generateReply(messageText: string, systemPrompt: string, knowledgeContext: string = ''): Promise<{ reply: string, handoff: boolean }> {
    this.logger.log(`Generating AI reply...`);
    
    const combinedPrompt = `${systemPrompt}\n\n${knowledgeContext ? `Use the following knowledge base facts if relevant:\n${knowledgeContext}\n\n` : ''}If the user explicitly asks to speak to a human agent, set your response appropriately and we will hand off.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: combinedPrompt },
          { role: 'user', content: messageText },
        ],
        temperature: 0.7,
      });

      const reply = response.choices[0].message.content || 'I am unable to process that right now.';
      const handoff = reply.toLowerCase().includes('human agent') || reply.toLowerCase().includes('connect you to a human');
      
      return { reply, handoff };
    } catch (error) {
      this.logger.error('Failed to generate AI reply', error);
      throw error;
    }
  }

  /**
   * Analyzes an incoming message for Sentiment, Tags, and Lead Score.
   */
  async analyzeMessage(messageText: string): Promise<{ sentiment: string, tags: string[], leadScore: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI assistant analyzing customer messages. 
Respond ONLY with a JSON object in this format:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "tags": ["array", "of", "relevant", "tags"],
  "leadScore": number between 0 and 100 representing purchase intent
}` 
          },
          { role: 'user', content: messageText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
      return { sentiment: 'NEUTRAL', tags: [], leadScore: 0 };
    } catch (error) {
      this.logger.error('Failed to analyze message', error);
      return { sentiment: 'NEUTRAL', tags: [], leadScore: 0 };
    }
  }

  /**
   * Generates 3 suggested replies based on conversation history.
   */
  async getSuggestedReplies(conversationHistory: string): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are assisting a customer support agent. 
Based on the following conversation history, suggest 3 short, distinct, and professional reply options the agent can select to send to the customer. 
Return ONLY a JSON array of 3 strings.` 
          },
          { role: 'user', content: conversationHistory },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (content) {
        // Fallback parsing just in case it wraps in an object { "replies": [...] }
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
        if (parsed.replies && Array.isArray(parsed.replies)) return parsed.replies.slice(0, 3);
        
        // If all else fails, extract values
        return Object.values(parsed).flat().slice(0, 3) as string[];
      }
      return [];
    } catch (error) {
      this.logger.error('Failed to get suggested replies', error);
      return [];
    }
  }

  /**
   * Generates a summary of a conversation.
   */
  async generateConversationSummary(conversationHistory: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize the following customer support conversation in a single, concise paragraph.' },
          { role: 'user', content: conversationHistory },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || 'Unable to generate summary.';
    } catch (error) {
      this.logger.error('Failed to generate summary', error);
      return 'Error generating summary.';
    }
  }

  /**
   * Basic search across the knowledge base.
   */
  async searchKnowledgeBase(clientId: string, query: string): Promise<string> {
    // Basic implementation: fetch active KB items and let the LLM filter/use them.
    // In a real implementation with vector DBs (e.g. pgvector), we'd do a similarity search here.
    const kbItems = await this.prisma.knowledgeBase.findMany({
      where: { clientId, isActive: true },
      select: { title: true, content: true }
    });

    if (kbItems.length === 0) return '';

    // Join them into a context string (limited to prevent huge token usage)
    const context = kbItems.map(item => `Q/Title: ${item.title}\nA/Content: ${item.content}`).join('\n\n');
    return context.substring(0, 3000); // simplistic truncation
  }
}
