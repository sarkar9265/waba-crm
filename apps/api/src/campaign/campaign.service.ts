import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectQueue('campaign_queue') private campaignQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async findAll(clientId: string, query: any = {}) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { clientId };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: { template: true },
      }),
      this.prisma.campaign.count({ where }),
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
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, clientId },
      include: { template: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(clientId: string, data: any) {
    return this.prisma.campaign.create({
      data: {
        ...data,
        clientId,
        status: 'DRAFT',
      },
    });
  }

  async update(clientId: string, id: string, data: any) {
    await this.findOne(clientId, id);
    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async launch(clientId: string, id: string) {
    const campaign = await this.findOne(clientId, id);
    if (campaign.status === 'RUNNING' || campaign.status === 'COMPLETED') {
      throw new BadRequestException('Campaign is already running or completed');
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    // Mock queueing logic
    // We don't have to resolve contacts here for the MVP, just mock a bulk enqueue
    this.logger.log(`Enqueuing campaign ${id} for audience ${JSON.stringify(campaign.audience)}`);
    
    // Simulate enqueuing 100 messages
    for (let i = 0; i < 100; i++) {
      await this.campaignQueue.add('send_template_message', {
        campaignId: id,
        contactId: `contact_${i}`,
        templateId: campaign.templateId,
      });
    }

    return updated;
  }

  async pause(clientId: string, id: string) {
    const campaign = await this.findOne(clientId, id);
    if (campaign.status !== 'RUNNING' && campaign.status !== 'SCHEDULED') {
      throw new BadRequestException('Can only pause running or scheduled campaigns');
    }

    // In a real app, we'd pause the bullmq queue for this campaign
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resume(clientId: string, id: string) {
    const campaign = await this.findOne(clientId, id);
    if (campaign.status !== 'PAUSED') {
      throw new BadRequestException('Campaign is not paused');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async retry(clientId: string, id: string) {
    const campaign = await this.findOne(clientId, id);
    // In a real app, we'd find failed jobs in BullMQ and retry them
    this.logger.log(`Retrying failed messages for campaign ${id}`);
    
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  async getQueueStatus(clientId: string) {
    // In a production app, you would query BullMQ:
    // const waiting = await this.campaignQueue.getWaitingCount();
    // const active = await this.campaignQueue.getActiveCount();
    // const failed = await this.campaignQueue.getFailedCount();
    
    // For this demonstration, we'll return mock data or calculate from DB if we tracked jobs in DB.
    // Let's return mock stats that look realistic for the dashboard
    return {
      waiting: Math.floor(Math.random() * 50),
      active: Math.floor(Math.random() * 10),
      failed: Math.floor(Math.random() * 5),
      delayed: 0,
    };
  }
}
