import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MsgDirection, MsgStatus } from '@algo-matrix/database';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService,
    private chatGateway: ChatGateway
  ) {}

  async getConversations(clientId: string, filters: any) {
    const { status, assignedTo, isArchived, isStarred, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { clientId };
    if (status) where.status = status;
    if (assignedTo) {
      where.assignedToId = assignedTo === 'unassigned' ? null : assignedTo;
    }
    if (isArchived !== undefined) where.isArchived = isArchived === 'true' || isArchived === true;
    if (isStarred !== undefined) where.isStarred = isStarred === 'true' || isStarred === true;

    return this.prisma.conversation.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        contact: true,
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateConversation(clientId: string, id: string, data: any) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, clientId }
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const updated = await this.prisma.conversation.update({
      where: { id },
      data
    });

    this.chatGateway.emitConversationUpdated(clientId, updated);
    
    return updated;
  }

  async bulkUpdateConversations(clientId: string, ids: string[], data: any) {
    const result = await this.prisma.conversation.updateMany({
      where: {
        id: { in: ids },
        clientId
      },
      data
    });

    // We fetch updated ones to emit events
    const updatedConversations = await this.prisma.conversation.findMany({
      where: {
        id: { in: ids },
        clientId
      }
    });

    for (const conv of updatedConversations) {
      this.chatGateway.emitConversationUpdated(clientId, conv);
    }

    return { count: result.count };
  }

  async getMessages(clientId: string, conversationId: string, cursor?: string, limit = 50) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clientId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const query: any = {
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor itself
    }

    const messages = await this.prisma.message.findMany(query);
    // Return in chronological order
    return messages.reverse();
  }

  async sendMessage(clientId: string, conversationId: string, data: any) {
    const { content, type = 'text', mediaUrl, mediaType, interactiveData, replyToId } = data;
    
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clientId },
      include: { contact: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Save message to DB
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        content: content || '[Media]',
        type,
        mediaUrl,
        mediaType,
        interactiveData,
        replyToId,
        direction: MsgDirection.OUTBOUND,
        status: MsgStatus.SENT,
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Actually send the message via WhatsApp Cloud API
    const wabaAccount = await this.prisma.wabaAccount.findFirst({ where: { clientId } });
    if (wabaAccount && wabaAccount.phoneNumberId) {
      let contentData: any = { body: content };
      
      if (['image', 'video', 'document', 'audio'].includes(type) && mediaUrl) {
        // Prepare media payload for Meta API
        // Real URL would be accessible by Meta (must be public)
        const publicUrl = process.env.BASE_URL ? `${process.env.BASE_URL}${mediaUrl}` : mediaUrl;
        contentData = { link: publicUrl };
        if (content) contentData.caption = content;
      } else if (type === 'interactive') {
        contentData = interactiveData;
      }
      
      await this.whatsappService.sendMessageToMeta(
        clientId, 
        wabaAccount.phoneNumberId, 
        conversation.contact.phone, 
        type, 
        contentData
      );
    }
    
    return message;
  }

  async updateMessage(clientId: string, id: string, data: any) {
    return this.prisma.message.update({
      where: { id, conversation: { clientId } },
      data
    });
  }

  async deleteMessage(clientId: string, id: string) {
    return this.prisma.message.update({
      where: { id, conversation: { clientId } },
      data: { isDeleted: true }
    });
  }
}
