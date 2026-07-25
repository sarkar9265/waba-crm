import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('campaign_queue')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) { 
    super(); 
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, contactId, templateName, variables, clientId } = job.data;
    
    this.logger.debug(`Processing job ${job.id} for campaign ${campaignId}`);
    
    try {
      // 1. Fetch Contact and WABA Account
      const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
      const wabaAccount = await this.prisma.wabaAccount.findFirst({ where: { clientId } });

      if (!contact || !wabaAccount || !wabaAccount.phoneNumberId) {
        throw new Error('Contact or WABA account not found');
      }

      // 2. Prepare Template payload
      const templateData: any = {
        name: templateName,
        language: { code: 'en' }, // Should ideally be dynamic
        components: []
      };

      if (variables && variables.length > 0) {
        templateData.components.push({
          type: "body",
          parameters: variables.map((v: string) => ({ type: "text", text: String(v) }))
        });
      }

      // 3. Send message via WhatsApp Cloud API
      const result = await this.whatsappService.sendMessageToMeta(
        clientId,
        wabaAccount.phoneNumberId,
        contact.phone,
        'template',
        templateData
      );

      const wamid = result?.messages?.[0]?.id;

      // 4. Find or create conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: { clientId, contactId }
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: { clientId, contactId, status: 'OPEN' }
        });
      }

      // 5. Create Message in Database linked to Campaign
      await this.prisma.message.create({
        data: {
          wamid,
          content: `[Template: ${templateName}]`,
          type: 'template',
          direction: 'OUTBOUND',
          status: 'SENT',
          conversationId: conversation.id,
          campaignId: campaignId
        }
      });
      
      // 6. Update Campaign metrics
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { sent: { increment: 1 } }
      });
      
      this.logger.log(`Successfully sent template [${templateName}] to contact [${contactId}]`);
      
    } catch (error) {
      this.logger.error(`Failed to send message to ${contactId}`, error.stack);
      
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { failed: { increment: 1 } }
      });

      throw error; 
    }
    
    return { success: true };
  }
}
