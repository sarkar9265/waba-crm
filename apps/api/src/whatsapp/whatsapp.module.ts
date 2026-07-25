import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WebhookProcessor } from './webhook.processor';
import { WebhookController } from './webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { ChatModule } from '../chat/chat.module';
import { AutomationModule } from '../automation/automation.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    PrismaModule, 
    HttpModule, 
    AiModule, 
    StorageModule, 
    forwardRef(() => ChatModule), 
    AutomationModule,
    BullModule.registerQueue({
      name: 'webhook',
    }),
  ],
  controllers: [WhatsappController, WebhookController],
  providers: [WhatsappService, WebhookProcessor],
  exports: [WhatsappService]
})
export class WhatsappModule {}
