import { Controller, Get, Param, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.clientId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Request() req: any, @Param('id') conversationId: string) {
    return this.chatService.getMessages(req.user.clientId, conversationId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body('content') content: string,
  ) {
    return this.chatService.sendMessage(req.user.clientId, conversationId, content);
  }
}
