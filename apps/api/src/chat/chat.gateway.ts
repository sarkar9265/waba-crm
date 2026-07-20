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
import { Logger } from '@nestjs/common';
import { ServerToClientEvents, ClientToServerEvents, ChatMessage, MessageStatusUpdate } from '@algo-matrix/shared';
// In a real app, you would import a service to verify the JWT token
// import { verifyToken } from '@clerk/clerk-sdk-node';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for dev. In prod, restrict to your Next.js domain
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(ChatGateway.name);

  // Map to store connected clients by their tenant/client ID
  private activeClients = new Map<string, string[]>();

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    
    if (!token) {
      this.logger.warn(`Client ${client.id} tried to connect without a token`);
      // client.disconnect();
      // return;
    }

    // Usually you would verify the token here:
    // const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    // const clientId = payload.clientId;
    
    // For now, we mock the clientId
    const clientId = 'mock_client_id';

    const clientRooms = this.activeClients.get(clientId) || [];
    clientRooms.push(client.id);
    this.activeClients.set(clientId, clientRooms);
    
    // Join a room specific to the tenant
    client.join(clientId);
    
    this.logger.log(`Client connected: ${client.id} to Tenant Room: ${clientId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Optionally clean up the activeClients map
  }

  /**
   * Method to broadcast a new incoming WhatsApp message to the specific tenant
   */
  emitNewMessage(clientId: string, message: ChatMessage) {
    this.server.to(clientId).emit('new_message', message);
    this.logger.log(`Emitted new_message to Tenant Room: ${clientId}`);
  }

  /**
   * Method to broadcast message status updates (sent/delivered/read)
   */
  emitMessageStatus(clientId: string, statusUpdate: MessageStatusUpdate) {
    this.server.to(clientId).emit('message_status', statusUpdate);
    this.logger.log(`Emitted message_status to Tenant Room: ${clientId}`);
  }
}
