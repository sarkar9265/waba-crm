import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController, AiConversationController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController, AiConversationController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
