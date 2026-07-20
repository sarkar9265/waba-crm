import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CampaignService } from './campaign.service';
import { CampaignProcessor } from './campaign.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'campaign_queue',
    }),
  ],
  providers: [CampaignService, CampaignProcessor],
  exports: [CampaignService],
})
export class CampaignModule {}
