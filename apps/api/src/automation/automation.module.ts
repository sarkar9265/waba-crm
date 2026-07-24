import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { HttpModule } from '@nestjs/axios';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [PrismaModule, AiModule, HttpModule, ChatModule],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
