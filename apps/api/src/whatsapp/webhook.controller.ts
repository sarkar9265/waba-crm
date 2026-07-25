import { Controller, Get, Post, Param, UseGuards, Query, HttpStatus, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhook') private readonly webhookQueue: Queue
  ) {}

  @Get('stats')
  async getStats() {
    const [pending, processed, failed] = await Promise.all([
      this.prisma.webhookLog.count({ where: { status: 'PENDING' } }),
      this.prisma.webhookLog.count({ where: { status: 'PROCESSED' } }),
      this.prisma.webhookLog.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      pending,
      processed,
      failed,
      total: pending + processed + failed,
    };
  }

  @Get('logs')
  async getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 50;
    const skip = (pageNumber - 1) * pageSize;

    const where = status ? { status: status.toUpperCase() as any } : {};

    const [logs, total] = await Promise.all([
      this.prisma.webhookLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.webhookLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  @Post(':id/retry')
  async retryWebhook(@Param('id') id: string) {
    const log = await this.prisma.webhookLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new HttpException('Webhook log not found', HttpStatus.NOT_FOUND);
    }

    if (log.status !== 'FAILED' && log.status !== 'PENDING') {
      throw new HttpException('Only FAILED or stuck PENDING webhooks can be retried', HttpStatus.BAD_REQUEST);
    }

    // Reset status and attempts
    const updatedLog = await this.prisma.webhookLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        error: null,
      },
    });

    // Add back to queue
    await this.webhookQueue.add('process', {
      payload: updatedLog.payload,
      webhookLogId: updatedLog.id,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    return { success: true, log: updatedLog };
  }
}
