import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(@InjectQueue('campaign_queue') private campaignQueue: Queue) {}

  /**
   * Enqueues a bulk messaging campaign.
   * Instead of sending thousands of messages synchronously, we chunk them 
   * and add them to the Redis queue to be processed at a controlled rate.
   */
  async enqueueCampaign(campaignId: string, templateName: string, targetContacts: string[]) {
    this.logger.log(`Enqueuing campaign ${campaignId} to ${targetContacts.length} contacts using template ${templateName}`);
    
    // In a real scenario, you'd chunk this if there are 10,000+ contacts.
    // For MVP, we'll queue them all individually.
    for (const contactId of targetContacts) {
      await this.campaignQueue.add('send_template_message', {
        campaignId,
        contactId,
        templateName,
      }, {
        // You can add delays, rate limiting, or backoff here
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    }

    return { status: 'queued', count: targetContacts.length };
  }
}
