import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import csv from 'csv-parser';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clientId: string, query: any = {}) {
    const { page = 1, limit = 50, search, tags, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { clientId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
      where.tags = { hasSome: tagsArray };
    }
    
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
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
    const contact = await this.prisma.contact.findFirst({ where: { id, clientId } });
    if (!contact) throw new BadRequestException('Contact not found');
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async delete(clientId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, clientId } });
    if (!contact) throw new BadRequestException('Contact not found');
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async bulkUpdate(clientId: string, data: { ids: string[], action: string, tags?: string[], status?: any }) {
    const { ids, action, tags, status } = data;
    
    if (action === 'addTags' && tags) {
      // Since prisma doesn't support array push well in updateMany natively without raw,
      // we update one by one for now for simplicity, or we fetch existing and append
      for (const id of ids) {
        const contact = await this.prisma.contact.findFirst({ where: { id, clientId } });
        if (contact) {
          const newTags = Array.from(new Set([...contact.tags, ...tags]));
          await this.prisma.contact.update({ where: { id }, data: { tags: newTags } });
        }
      }
      return { success: true, count: ids.length };
    } else if (action === 'removeTags' && tags) {
      for (const id of ids) {
        const contact = await this.prisma.contact.findFirst({ where: { id, clientId } });
        if (contact) {
          const newTags = contact.tags.filter(t => !tags.includes(t));
          await this.prisma.contact.update({ where: { id }, data: { tags: newTags } });
        }
      }
      return { success: true, count: ids.length };
    } else if (action === 'updateStatus' && status) {
      const result = await this.prisma.contact.updateMany({
        where: { id: { in: ids }, clientId },
        data: { status }
      });
      return { success: true, count: result.count };
    } else if (action === 'delete') {
      const result = await this.prisma.contact.deleteMany({
        where: { id: { in: ids }, clientId },
      });
      return { success: true, count: result.count };
    }
    throw new BadRequestException('Invalid bulk action');
  }

  async mergeContacts(clientId: string, primaryId: string, secondaryId: string) {
    if (primaryId === secondaryId) throw new BadRequestException('Cannot merge same contact');
    
    const primary = await this.prisma.contact.findFirst({ where: { id: primaryId, clientId } });
    const secondary = await this.prisma.contact.findFirst({ where: { id: secondaryId, clientId } });
    
    if (!primary || !secondary) throw new BadRequestException('Contact(s) not found');
    
    // Move all conversations to primary
    await this.prisma.conversation.updateMany({
      where: { contactId: secondaryId },
      data: { contactId: primaryId },
    });
    
    // Merge tags
    const newTags = Array.from(new Set([...primary.tags, ...secondary.tags]));
    
    await this.prisma.contact.update({
      where: { id: primaryId },
      data: {
        tags: newTags,
        firstName: primary.firstName || secondary.firstName,
        lastName: primary.lastName || secondary.lastName,
        email: primary.email || secondary.email,
        phone: primary.phone, // keep primary phone
      }
    });
    
    await this.prisma.contact.delete({ where: { id: secondaryId } });
    
    return { success: true };
  }

  async findDuplicates(clientId: string) {
    // Basic duplicate detection by identical phone or identical email (if exists)
    // We can group them by phone
    const contacts = await this.prisma.contact.findMany({ where: { clientId } });
    const byPhone: Record<string, any[]> = {};
    const byEmail: Record<string, any[]> = {};

    contacts.forEach(c => {
      if (c.phone) {
        if (!byPhone[c.phone]) byPhone[c.phone] = [];
        byPhone[c.phone].push(c);
      }
      if (c.email) {
        if (!byEmail[c.email]) byEmail[c.email] = [];
        byEmail[c.email].push(c);
      }
    });

    const duplicates: { reason: string; contacts: any[] }[] = [];
    
    for (const phone in byPhone) {
      if (byPhone[phone].length > 1) {
        duplicates.push({ reason: 'Identical Phone', contacts: byPhone[phone] });
      }
    }

    for (const email in byEmail) {
      if (byEmail[email].length > 1) {
        // avoid adding the same pair if already caught by phone
        const duplicateIds = byEmail[email].map(c => c.id).sort().join(',');
        const alreadyFound = duplicates.some(d => d.contacts.map((c:any) => c.id).sort().join(',') === duplicateIds);
        if (!alreadyFound) {
          duplicates.push({ reason: 'Identical Email', contacts: byEmail[email] });
        }
      }
    }

    return duplicates;
  }

  async getTimeline(clientId: string, id: string) {
    // Fetch conversations and messages related to the contact
    const conversations = await this.prisma.conversation.findMany({
      where: { contactId: id, clientId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    return conversations;
  }

  async importContacts(clientId: string, filePath: string) {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          let count = 0;
          for (const row of results) {
            const phone = row.phone || row.Phone;
            if (!phone) continue;

            const existing = await this.prisma.contact.findFirst({ where: { phone, clientId } });
            const dataToSave = {
              firstName: row.firstName || row.FirstName || row.name || row.Name || '',
              lastName: row.lastName || row.LastName || '',
              email: row.email || row.Email || '',
              tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
            };

            if (existing) {
              await this.prisma.contact.update({
                where: { id: existing.id },
                data: dataToSave
              });
            } else {
              await this.prisma.contact.create({
                data: {
                  ...dataToSave,
                  phone,
                  clientId,
                }
              });
            }
            count++;
          }
          fs.unlinkSync(filePath);
          resolve({ success: true, count });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  async exportContacts(clientId: string) {
    const contacts = await this.prisma.contact.findMany({ where: { clientId } });
    const header = 'id,firstName,lastName,phone,email,status,tags\n';
    const rows = contacts.map(c => 
      `${c.id},${c.firstName || ''},${c.lastName || ''},${c.phone},${c.email || ''},${c.status},"${c.tags.join(',')}"`
    ).join('\n');
    return header + rows;
  }
}
