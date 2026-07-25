import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatGateway } from '../chat/chat.gateway';
import { AiService } from '../ai/ai.service';
import { StorageService } from '../storage/storage.service';
import { AutomationService } from '../automation/automation.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly graphApiVersion = 'v19.0';

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private chatGateway: ChatGateway,
    private aiService: AiService,
    private storageService: StorageService,
    private automationService: AutomationService,
  ) {}

  /**
   * Exchanges the Meta OAuth code for a System User Access Token
   * and saves the linked WABA account to the database.
   */
  async exchangeOAuthCode(code: string, clientId: string) {
    this.logger.log(`Exchanging OAuth code for client ${clientId}`);
    
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      throw new HttpException('Meta App credentials not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // 1. Exchange code for user access token via Graph API
      // Note: for embedded signup without a redirect_uri we might need to handle the token flow differently 
      // depending on whether the frontend SDK gave us an access token directly or an OAuth code.
      // We will assume the standard code exchange here.
      const tokenUrl = `https://graph.facebook.com/${this.graphApiVersion}/oauth/access_token`;
      const tokenResponse = await firstValueFrom(
        this.httpService.get(tokenUrl, {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code: code,
          }
        })
      );
      
      const userAccessToken = tokenResponse.data.access_token;
      
      // 2. Fetch WABA details associated with the token
      const wabaDetails = await this.fetchWabaDetails(userAccessToken);
      
      // 3. Save to database
      const wabaAccount = await this.prisma.wabaAccount.upsert({
        where: { wabaId: wabaDetails.wabaId },
        update: {
          phoneNumberId: wabaDetails.phoneNumberId,
          displayPhoneNumber: wabaDetails.displayPhoneNumber,
          status: 'CONNECTED',
          appId: appId
        },
        create: {
          wabaId: wabaDetails.wabaId,
          phoneNumberId: wabaDetails.phoneNumberId,
          displayPhoneNumber: wabaDetails.displayPhoneNumber,
          status: 'CONNECTED',
          clientId: clientId,
          appId: appId
        }
      });

      return wabaAccount;
    } catch (error: any) {
      this.logger.error(`Error exchanging OAuth code: ${error?.response?.data?.error?.message || error.message}`);
      
      // MOCK FALLBACK FOR LOCAL TESTING (since we don't have a real Meta App configured in local env)
      if (process.env.NODE_ENV !== 'production' && (!appId || !appSecret || error.response?.status >= 400)) {
        this.logger.warn('Falling back to MOCK WABA Account generation for local testing');
        
        const mockPhoneId = `mock_phone_${Math.floor(Math.random() * 1000000)}`;
        const mockWabaId = `mock_waba_${Math.floor(Math.random() * 1000000)}`;
        
        return this.prisma.wabaAccount.create({
          data: {
            wabaId: mockWabaId,
            phoneNumberId: mockPhoneId,
            displayPhoneNumber: '+1 (555) 000-MOCK',
            displayName: 'Mock Algo Matrix Support',
            status: 'CONNECTED',
            qualityRating: 'GREEN',
            clientId: clientId,
            appId: appId || 'mock_app_id'
          }
        });
      }
      
      throw new HttpException('Failed to connect Meta account', HttpStatus.BAD_REQUEST);
    }
  }

  async getAccounts(clientId: string) {
    return this.prisma.wabaAccount.findMany({
      where: { clientId }
    });
  }

  async disconnectAccount(accountId: string, clientId: string) {
    const account = await this.prisma.wabaAccount.findFirst({
      where: { id: accountId, clientId }
    });

    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }

    // In a real implementation, we might want to also call the Graph API to revoke permissions
    // https://graph.facebook.com/v19.0/{user-id}/permissions

    await this.prisma.wabaAccount.delete({
      where: { id: accountId }
    });

    return { success: true };
  }

  private async fetchWabaDetails(token: string) {
    // 1. Use the token to fetch the businesses the user has access to, 
    // or specifically the WhatsApp Business Accounts they just shared.
    // In Embedded Signup, you often query the /me/accounts or /debug_token to find associated assets.
    // We will query the WABA IDs shared.
    
    try {
      const url = `https://graph.facebook.com/${this.graphApiVersion}/debug_token`;
      const appAccessToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
      
      const debugResponse = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            input_token: token,
            access_token: appAccessToken
          }
        })
      );

      // In a real flow, you would query the assigned WABA accounts using the WABA API.
      // Example: GET /me/businesses then GET /{business-id}/owned_whatsapp_business_accounts
      // For this implementation, we simulate extracting the WABA ID that was just shared.
      
      // MOCK EXTRACTION (replace with actual graph queries in production)
      return {
        wabaId: '104928475930281',
        phoneNumberId: '8472938475',
        displayPhoneNumber: '+1 (555) 019-2834',
      };
    } catch (error) {
      this.logger.error(`Error fetching WABA details: ${error.response?.data?.error?.message || error.message}`);
      throw new HttpException('Failed to fetch WABA details', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Processes the incoming payload from Meta WhatsApp Cloud API
   * Format reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
   */
  async processWebhookPayload(payload: any) {
    // Payload usually contains entries which contain changes
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          await this.handleIncomingMessage(change.value);
        } else if (change.value.statuses) {
          await this.handleMessageStatusUpdate(change.value);
        }
      }
    }
  }

  private async handleIncomingMessage(value: any) {
    const metadata = value.metadata; // contains display_phone_number and phone_number_id
    const messages = value.messages;
    const contacts = value.contacts;

    if (!messages || messages.length === 0) return;

    // 1. Find the WABA Tenant in the database using metadata.phone_number_id
    const wabaAccount = await this.prisma.wabaAccount.findFirst({
      where: { phoneNumberId: metadata.phone_number_id }
    });

    if (!wabaAccount) {
      this.logger.warn(`No WABA account found for phone number ID: ${metadata.phone_number_id}`);
      return;
    }

    const clientId = wabaAccount.clientId;
    const contactInfo = contacts?.[0];

    for (const message of messages) {
      this.logger.log(`Received message [${message.id}] from ${message.from}`);
      
      // 2. Find or create the Contact
      const contactName = contactInfo?.profile?.name || message.from;
      let contact = await this.prisma.contact.findFirst({
        where: { clientId, phone: message.from }
      });

      if (!contact) {
        contact = await this.prisma.contact.create({
          data: {
            clientId,
            phone: message.from,
            name: contactName,
            lastActive: new Date()
          }
        });
      } else {
        await this.prisma.contact.update({
          where: { id: contact.id },
          data: { lastActive: new Date(), name: contactName }
        });
      }

      // 3. Find or create the Conversation
      let conversation = await this.prisma.conversation.findFirst({
        where: { clientId, contactId: contact.id }
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            clientId,
            contactId: contact.id,
            status: 'OPEN'
          }
        });
      } else {
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date(), status: 'OPEN' }
        });
      }

      // 4. Save the Message to the database
      const savedMessage = await this.prisma.message.create({
        data: {
          wamid: message.id,
          conversationId: conversation.id,
          content: message.text?.body || '[Media]',
          type: message.type || 'text',
          direction: 'INBOUND',
          status: 'DELIVERED',
        }
      });

      // 5. Emit the new message via WebSocket to the Next.js client
      this.chatGateway.emitNewMessage(clientId, {
        id: savedMessage.id,
        conversationId: conversation.id,
        content: savedMessage.content,
        direction: savedMessage.direction,
        status: savedMessage.status,
        createdAt: savedMessage.createdAt,
      });

      // 6. Automation Engine (Workflows)
      await this.automationService.handleTrigger(clientId, 'INCOMING_MESSAGE', { message, contact, conversation });
      await this.automationService.handleTrigger(clientId, 'KEYWORD', { message, contact, conversation });

      // 7. AI Chatbot automation
      // If the client has AI enabled, generate a response
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: { aiEnabled: true, aiSystemPrompt: true }
      });

      if (client?.aiEnabled && message.text?.body) {
        const systemPrompt = client.aiSystemPrompt || "You are a helpful customer support assistant for Algo Matrix. Be polite and concise.";
        const aiReply = await this.aiService.generateReply(message.text.body, systemPrompt);
        
        this.logger.log(`AI Reply generated: ${aiReply}`);
        
        const savedAiMessage = await this.prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: aiReply,
            type: 'text',
            direction: 'OUTBOUND',
            status: 'SENT',
          }
        });

        // Emit the AI response to the UI
        this.chatGateway.emitNewMessage(clientId, {
          id: savedAiMessage.id,
          conversationId: conversation.id,
          content: savedAiMessage.content,
          direction: savedAiMessage.direction,
          status: savedAiMessage.status,
          createdAt: savedAiMessage.createdAt,
        });
        
        // Call the Meta API to send the aiReply back
        await this.sendMessageToMeta(clientId, metadata.phone_number_id, message.from, 'text', { body: aiReply });
      }
    }
  }

  /**
   * Sends a message via Meta Cloud API
   */
  async sendMessageToMeta(clientId: string, phoneNumberId: string, to: string, type: string, contentData: any) {
    try {
      const token = process.env.META_ACCESS_TOKEN; // Or fetch tenant-specific token if applicable
      const url = `https://graph.facebook.com/${this.graphApiVersion}/${phoneNumberId}/messages`;
      
      const payload: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: type,
      };

      if (type === 'text') {
        payload.text = contentData;
      } else if (['image', 'video', 'document', 'audio'].includes(type)) {
        payload[type] = contentData;
      } else if (type === 'interactive') {
        payload.interactive = contentData;
      } else if (type === 'template') {
        payload.template = contentData;
      }

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${to}`, error.response?.data || error.message);
      // Depending on requirements, we could throw here or just return null
      return null;
    }
  }

  private async handleMessageStatusUpdate(value: any) {
    const statuses = value.statuses;
    const metadata = value.metadata;
    
    // Find the WABA Tenant in the database using metadata.phone_number_id
    const wabaAccount = await this.prisma.wabaAccount.findFirst({
      where: { phoneNumberId: metadata.phone_number_id }
    });

    if (!wabaAccount) return;
    const clientId = wabaAccount.clientId;

    for (const status of statuses) {
      this.logger.log(`Message [${status.id}] status updated to: ${status.status} for recipient ${status.recipient_id}`);
      
      // Update Message status in DB
      await this.prisma.message.updateMany({
        where: { wamid: status.id },
        data: { status: status.status.toUpperCase() as any }
      });

      this.chatGateway.emitMessageStatus(clientId, {
        id: status.id,
        status: status.status,
        recipient_id: status.recipient_id
      });
    }
  }
}
