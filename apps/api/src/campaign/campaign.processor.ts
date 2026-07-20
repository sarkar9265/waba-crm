import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('campaign_queue')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name);

  // You would inject your WhatsappService here to actually send the HTTP request
  // constructor(private whatsappService: WhatsappService) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, contactId, templateName } = job.data;
    
    this.logger.debug(`Processing job ${job.id} for campaign ${campaignId}`);
    
    try {
      // Here you would call Meta API to send the template message:
      // await this.whatsappService.sendTemplateMessage(contactId, templateName);
      
      this.logger.log(`Successfully sent template [${templateName}] to contact [${contactId}]`);
      
      // Update database to mark message as sent for this campaign
    } catch (error) {
      this.logger.error(`Failed to send message to ${contactId}`, error.stack);
      throw error; // Will trigger BullMQ retry logic
    }
    
    return { success: true };
  }
}
