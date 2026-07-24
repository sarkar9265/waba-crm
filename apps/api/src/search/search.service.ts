import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(clientId: string, query: string) {
    if (!query || query.trim().length < 2) {
      return { contacts: [], messages: [], campaigns: [], templates: [], users: [] };
    }

    const term = query.trim();

    const [contacts, messages, campaigns, templates, users] = await Promise.all([
      this.searchContacts(clientId, term),
      this.searchMessages(clientId, term),
      this.searchCampaigns(clientId, term),
      this.searchTemplates(clientId, term),
      this.searchUsers(clientId, term),
    ]);

    return { contacts, messages, campaigns, templates, users };
  }

  private async searchContacts(clientId: string, term: string) {
    return this.prisma.contact.findMany({
      where: {
        clientId,
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        phone: true,
        email: true,
        avatarUrl: true,
        status: true,
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async searchMessages(clientId: string, term: string) {
    return this.prisma.message.findMany({
      where: {
        conversation: { clientId },
        content: { contains: term, mode: 'insensitive' },
        isDeleted: false,
      },
      select: {
        id: true,
        content: true,
        direction: true,
        createdAt: true,
        conversation: {
          select: {
            id: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async searchCampaigns(clientId: string, term: string) {
    return this.prisma.campaign.findMany({
      where: {
        clientId,
        name: { contains: term, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        status: true,
        sent: true,
        delivered: true,
        scheduledAt: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async searchTemplates(clientId: string, term: string) {
    return this.prisma.template.findMany({
      where: {
        clientId,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        language: true,
        status: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async searchUsers(clientId: string, term: string) {
    return this.prisma.user.findMany({
      where: {
        clientId,
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }
}
