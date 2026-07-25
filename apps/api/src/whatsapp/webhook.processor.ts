import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('webhook', {
  concurrency: 50,
})
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ payload: any; webhookLogId: string }>) {
    const { payload, webhookLogId } = job.data;
    this.logger.log(`Processing webhook job ${job.id} for log ${webhookLogId}`);

    try {
      // Execute the actual webhook logic
      await this.whatsappService.processWebhookPayload(payload);

      // Mark as processed
      await this.prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: {
          status: 'PROCESSED',
          attempts: { increment: 1 },
        },
      });

      this.logger.log(`Webhook job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Webhook job ${job.id} failed: ${error.message}`, error.stack);
      
      // Update DB with the error
      await this.prisma.webhookLog.update({
        where: { id: webhookLogId },
        data: {
          error: error.message,
          attempts: { increment: 1 },
        },
      });

      // We re-throw so BullMQ knows it failed and can apply retry strategy
      throw error;
    }
  }
}
