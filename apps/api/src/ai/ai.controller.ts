import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

@UseGuards(JwtAuthGuard)
@Controller('ai/config')
export class AiController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getConfig(@Request() req: any) {
    const client = await this.prisma.client.findUnique({
      where: { id: req.user.clientId },
      select: { aiEnabled: true, aiSystemPrompt: true },
    });
    
    return client || { aiEnabled: false, aiSystemPrompt: '' };
  }

  @Post()
  async updateConfig(
    @Request() req: any,
    @Body() body: { aiEnabled: boolean; aiSystemPrompt: string },
  ) {
    const updated = await this.prisma.client.update({
      where: { id: req.user.clientId },
      data: {
        aiEnabled: body.aiEnabled,
        aiSystemPrompt: body.aiSystemPrompt,
      },
      select: { aiEnabled: true, aiSystemPrompt: true },
    });
    
    return updated;
  }
}

@UseGuards(JwtAuthGuard)
@Controller('ai/conversations')
export class AiConversationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  @Get(':id/suggested-replies')
  async getSuggestedReplies(@Request() req: any, @Param('id') id: string) {
    // 1. Fetch recent conversation history
    const messages = await this.prisma.message.findMany({
      where: { conversationId: id, conversation: { clientId: req.user.clientId } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (messages.length === 0) return { suggestions: [] };

    // Reverse to chronological order
    const historyText = messages.reverse().map(m => `${m.direction === 'INBOUND' ? 'Customer' : 'Agent'}: ${m.content}`).join('\n');

    const suggestions = await this.aiService.getSuggestedReplies(historyText);
    return { suggestions };
  }

  @Get(':id/summary')
  async getSummary(@Request() req: any, @Param('id') id: string) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId: id, conversation: { clientId: req.user.clientId } },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) return { summary: 'No conversation history.' };

    const historyText = messages.map(m => `${m.direction === 'INBOUND' ? 'Customer' : 'Agent'}: ${m.content}`).join('\n');
    const summary = await this.aiService.generateConversationSummary(historyText);
    
    return { summary };
  }

  @Post(':id/handoff')
  async toggleHandoff(
    @Request() req: any, 
    @Param('id') id: string,
    @Body() body: { botStatus: 'ACTIVE' | 'HANDOFF' }
  ) {
    const updated = await this.prisma.conversation.update({
      where: { id, clientId: req.user.clientId },
      data: { botStatus: body.botStatus || 'HANDOFF' }
    });
    
    return { success: true, botStatus: updated.botStatus };
  }
}
