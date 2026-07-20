import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clientId: string) {
    return this.prisma.contact.findMany({
      where: { clientId },
      orderBy: { lastActive: 'desc' },
    });
  }

  async findOne(clientId: string, id: string) {
    return this.prisma.contact.findFirst({
      where: { id, clientId },
    });
  }

  async create(clientId: string, data: any) {
    return this.prisma.contact.create({
      data: {
        ...data,
        clientId,
      },
    });
  }

  async update(clientId: string, id: string, data: any) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.clientId !== clientId) throw new Error('Not found');
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(clientId: string, id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.clientId !== clientId) throw new Error('Not found');
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
