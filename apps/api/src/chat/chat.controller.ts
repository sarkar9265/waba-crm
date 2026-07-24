import { Controller, Get, Param, Post, Body, UseGuards, Request, Query, Patch, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('isArchived') isArchived?: boolean,
    @Query('isStarred') isStarred?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getConversations(req.user.clientId, {
      status, assignedTo, isArchived, isStarred, page, limit
    });
  }

  @Patch('conversations')
  bulkUpdateConversations(
    @Request() req: any,
    @Body() body: { ids: string[], data: any }
  ) {
    return this.chatService.bulkUpdateConversations(req.user.clientId, body.ids, body.data);
  }

  @Patch('conversations/:id')
  updateConversation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.chatService.updateConversation(req.user.clientId, id, data);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Request() req: any, 
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number
  ) {
    return this.chatService.getMessages(req.user.clientId, conversationId, cursor, limit);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() data: { content?: string, type?: string, mediaUrl?: string, mediaType?: string, interactiveData?: any, replyToId?: string }
  ) {
    return this.chatService.sendMessage(req.user.clientId, conversationId, data);
  }

  @Patch('messages/:id')
  updateMessage(
    @Request() req: any,
    @Param('id') messageId: string,
    @Body() data: { isPinned?: boolean, status?: string }
  ) {
    return this.chatService.updateMessage(req.user.clientId, messageId, data);
  }

  @Delete('messages/:id')
  deleteMessage(
    @Request() req: any,
    @Param('id') messageId: string
  ) {
    return this.chatService.deleteMessage(req.user.clientId, messageId);
  }
}

