import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { ChatModule } from '../chat/chat.module';
import { AutomationModule } from '../automation/automation.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [PrismaModule, HttpModule, AiModule, StorageModule, forwardRef(() => ChatModule), AutomationModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService]
})
export class WhatsappModule {}
