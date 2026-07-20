import { Module, Global } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Global() // Making it global so WhatsappService can easily inject it
@Module({
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
