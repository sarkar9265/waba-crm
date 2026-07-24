import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { ServerToClientEvents, ClientToServerEvents } from '@algo-matrix/shared';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(ChatGateway.name);
  private activeClients = new Map<string, string[]>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      this.logger.warn(`Client ${client.id} tried to connect without a token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'supersecretkey' });
      const clientId = payload.clientId;
      
      if (!clientId) {
        this.logger.warn(`Token valid but no clientId found for client ${client.id}`);
        client.disconnect();
        return;
      }

      const clientRooms = this.activeClients.get(clientId) || [];
      clientRooms.push(client.id);
      this.activeClients.set(clientId, clientRooms);
      
      client.join(clientId);
      this.logger.log(`Client connected: ${client.id} to Tenant Room: ${clientId}`);
    } catch (error) {
      this.logger.warn(`Invalid token for client ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitNewMessage(clientId: string, message: any) {
    this.server.to(clientId).emit('new_message', message);
    this.logger.log(`Emitted new_message to Tenant Room: ${clientId}`);
  }

  emitMessageStatus(clientId: string, statusUpdate: any) {
    this.server.to(clientId).emit('message_status', statusUpdate);
    this.logger.log(`Emitted message_status to Tenant Room: ${clientId}`);
  }

  emitConversationUpdated(clientId: string, conversation: any) {
    this.server.to(clientId).emit('conversation_updated', conversation);
    this.logger.log(`Emitted conversation_updated to Tenant Room: ${clientId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string, isTyping: boolean },
    @ConnectedSocket() client: Socket
  ) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return;
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'supersecretkey' });
      const clientId = payload.clientId;
      // Broadcast to other clients in the same tenant room
      client.to(clientId).emit('typing', { ...data, userId: payload.sub });
    } catch (error) {
      // Ignore
    }
  }
}
