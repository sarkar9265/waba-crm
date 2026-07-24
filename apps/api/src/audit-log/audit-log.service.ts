import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    clientId: string,
    userId: string,
    action: string,
    entityId?: string,
    entityType?: string,
    details?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        clientId,
        userId,
        action,
        entityId,
        entityType,
        details: details ? details : undefined,
      },
    });
  }

  async getWorkspaceLogs(clientId: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }
}
