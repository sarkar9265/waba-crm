import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string) {
    return this.prisma.knowledgeBase.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(clientId: string, id: string) {
    const item = await this.prisma.knowledgeBase.findFirst({
      where: { id, clientId }
    });
    if (!item) throw new NotFoundException('Knowledge base item not found');
    return item;
  }

  async create(clientId: string, data: { title: string; content: string; isActive?: boolean }) {
    return this.prisma.knowledgeBase.create({
      data: {
        ...data,
        clientId
      }
    });
  }

  async update(clientId: string, id: string, data: { title?: string; content?: string; isActive?: boolean }) {
    await this.findOne(clientId, id); // Ensure it exists
    return this.prisma.knowledgeBase.update({
      where: { id },
      data
    });
  }

  async remove(clientId: string, id: string) {
    await this.findOne(clientId, id); // Ensure it exists
    return this.prisma.knowledgeBase.delete({
      where: { id }
    });
  }
}
