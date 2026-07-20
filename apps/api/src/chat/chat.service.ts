import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MsgDirection, MsgStatus } from '@algo-matrix/database';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(clientId: string) {
    return this.prisma.conversation.findMany({
      where: { clientId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the latest message for the preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(clientId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clientId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(clientId: string, conversationId: string, content: string) {
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
        content,
        type: 'text',
        direction: MsgDirection.OUTBOUND,
        status: MsgStatus.SENT, // Ideally should be queued and updated when WA confirms
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // TODO: Actually send the message via WhatsApp Cloud API using WhatsappService.
    
    return message;
  }
}
