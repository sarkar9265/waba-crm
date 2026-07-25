import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CampaignService } from './campaign.service';
import { CampaignProcessor } from './campaign.processor';
import { CampaignController } from './campaign.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    PrismaModule,
    WhatsappModule,
    BullModule.registerQueue({
      name: 'campaign_queue',
    }),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignProcessor],
  exports: [CampaignService],
})
export class CampaignModule {}
