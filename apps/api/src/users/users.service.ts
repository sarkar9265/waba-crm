import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@algo-matrix/database';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private audit: AuditLogService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAllByTenant(clientId: string) {
    return this.prisma.user.findMany({
      where: { clientId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any, requesterId?: string) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(data.password || 'Password123!', 10);

    let clientId = data.clientId;
    let role = data.role || Role.AGENT;

    if (!clientId && !requesterId) {
      const newClient = await this.prisma.client.create({
        data: { name: `${data.name || 'My'}'s Workspace` }
      });
      clientId = newClient.id;
      role = Role.CLIENT_OWNER;
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role,
        clientId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
      }
    });

    if (requesterId && data.clientId) {
      await this.audit.logAction(data.clientId, requesterId, 'USER_INVITED', user.id, 'USER', { email: data.email, role: data.role });
    }

    return user;
  }

  async updateRole(clientId: string, targetUserId: string, newRole: Role, requesterId: string) {
    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetUserId, clientId }
    });

    if (!targetUser) {
      throw new HttpException('User not found in this workspace', HttpStatus.NOT_FOUND);
    }

    if (targetUser.role === Role.CLIENT_OWNER && newRole !== Role.CLIENT_OWNER) {
      const ownersCount = await this.prisma.user.count({
        where: { clientId, role: Role.CLIENT_OWNER }
      });
      if (ownersCount <= 1) {
        throw new HttpException('Cannot change the role of the only CLIENT_OWNER', HttpStatus.BAD_REQUEST);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
      }
    });

    await this.audit.logAction(clientId, requesterId, 'USER_ROLE_CHANGED', targetUserId, 'USER', { oldRole: targetUser.role, newRole });

    return updated;
  }

  async delete(clientId: string, targetUserId: string, requesterId: string) {
    if (targetUserId === requesterId) {
      throw new HttpException('You cannot remove yourself', HttpStatus.BAD_REQUEST);
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { id: targetUserId, clientId }
    });

    if (!targetUser) {
      throw new HttpException('User not found in this workspace', HttpStatus.NOT_FOUND);
    }

    if (targetUser.role === Role.CLIENT_OWNER) {
      throw new HttpException('Cannot remove a CLIENT_OWNER', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.user.delete({
      where: { id: targetUserId }
    });

    await this.audit.logAction(clientId, requesterId, 'USER_REMOVED', targetUserId, 'USER', { email: targetUser.email, role: targetUser.role });

    return { success: true };
  }
}
