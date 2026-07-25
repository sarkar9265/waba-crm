import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(clientId: string, query: any = {}) {
    const { page = 1, limit = 20, search, status, category, language } = query;
    const skip = (page - 1) * limit;

    const where: any = { clientId };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (language && language !== 'ALL') where.language = language;

    const [data, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(clientId: string, id: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, clientId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(clientId: string, data: any) {
    return this.prisma.template.create({
      data: {
        ...data,
        clientId,
        status: 'SUBMITTED', // Default to submitted when created via UI
      },
    });
  }

  async delete(clientId: string, id: string) {
    await this.findOne(clientId, id); // Verify existence and ownership
    return this.prisma.template.delete({
      where: { id },
    });
  }

  async syncWithMeta(clientId: string, id: string) {
    const template = await this.findOne(clientId, id);
    
    // MOCK SYNC: If it's SUBMITTED, we flip it to APPROVED.
    // In a real scenario, this would call WhatsApp Business API to check status.
    const newStatus = template.status === 'SUBMITTED' ? 'APPROVED' : template.status;

    return this.prisma.template.update({
      where: { id },
      data: { status: newStatus as any },
    });
  }
}
