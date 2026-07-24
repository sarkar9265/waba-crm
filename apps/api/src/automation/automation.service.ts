import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiService } from '../ai/ai.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private aiService: AiService,
    private chatGateway: ChatGateway,
  ) {}

  async getAutomations(clientId: string) {
    return this.prisma.automation.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAutomation(clientId: string, id: string) {
    return this.prisma.automation.findUnique({
      where: { id, clientId },
    });
  }

  async createAutomation(clientId: string, data: any) {
    return this.prisma.automation.create({
      data: {
        clientId,
        name: data.name || 'New Automation',
        triggerType: data.triggerType || 'INCOMING_MESSAGE',
        triggerConditions: data.triggerConditions || {},
        nodes: data.nodes || [],
        edges: data.edges || [],
        isActive: data.isActive ?? false,
      },
    });
  }

  async updateAutomation(clientId: string, id: string, data: any) {
    return this.prisma.automation.update({
      where: { id, clientId },
      data: {
        name: data.name,
        triggerType: data.triggerType,
        triggerConditions: data.triggerConditions,
        nodes: data.nodes,
        edges: data.edges,
        isActive: data.isActive,
      },
    });
  }

  async deleteAutomation(clientId: string, id: string) {
    return this.prisma.automation.delete({
      where: { id, clientId },
    });
  }

  /**
   * Evaluates and runs automations for a given trigger
   */
  async handleTrigger(clientId: string, triggerType: string, context: { message?: any, contact?: any, conversation?: any }) {
    try {
      const automations = await this.prisma.automation.findMany({
        where: { clientId, isActive: true, triggerType },
      });

      if (!automations.length) return;

      const wabaAccount = await this.prisma.wabaAccount.findFirst({
        where: { clientId, status: 'CONNECTED' },
      });

      if (!wabaAccount || !wabaAccount.phoneNumberId) return;

      for (const automation of automations) {
        // Evaluate conditions if any
        if (triggerType === 'KEYWORD') {
          const keywords = (automation.triggerConditions as any)?.keywords || [];
          const msgText = context.message?.text?.body?.toLowerCase() || '';
          const match = keywords.some((kw: string) => msgText.includes(kw.toLowerCase()));
          if (!match) continue;
        }

        // Run the workflow
        await this.executeWorkflow(automation, wabaAccount.phoneNumberId, context);
      }
    } catch (error) {
      this.logger.error(`Error handling automation trigger: ${error.message}`);
    }
  }

  private async executeWorkflow(automation: any, phoneNumberId: string, context: any) {
    const nodes = automation.nodes as any[] || [];
    const edges = automation.edges as any[] || [];

    // Find the starting node (trigger node)
    const startNode = nodes.find(n => n.type === 'triggerNode');
    if (!startNode) return;

    let currentNodeId = startNode.id;
    let keepGoing = true;

    while (keepGoing) {
      // Find edge going out of current node
      const edge = edges.find(e => e.source === currentNodeId);
      if (!edge) {
        keepGoing = false;
        break; // End of workflow
      }

      // Find next node
      const nextNode = nodes.find(n => n.id === edge.target);
      if (!nextNode) {
        keepGoing = false;
        break;
      }

      // Execute next node
      await this.executeActionNode(nextNode, phoneNumberId, context);
      currentNodeId = nextNode.id;
    }
  }

  private async executeActionNode(node: any, phoneNumberId: string, context: any) {
    if (node.type !== 'actionNode') return;
    const data = node.data;
    const clientId = context.conversation.clientId;

    try {
      if (data.actionType === 'reply') {
        const text = data.text || '';
        await this.sendWhatsAppMessage(phoneNumberId, context.contact.phone, text);
        await this.saveAndEmitMessage(clientId, context.conversation.id, text);
      } 
      else if (data.actionType === 'ai_reply') {
        const clientConfig = await this.prisma.client.findUnique({ where: { id: clientId } });
        const systemPrompt = data.systemPrompt || clientConfig?.aiSystemPrompt || "You are a helpful assistant.";
        const userMsg = context.message?.text?.body || '';
        const aiReply = await this.aiService.generateReply(userMsg, systemPrompt);
        
        await this.sendWhatsAppMessage(phoneNumberId, context.contact.phone, aiReply);
        await this.saveAndEmitMessage(clientId, context.conversation.id, aiReply);
      }
      else if (data.actionType === 'delay') {
        const ms = (data.delaySeconds || 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
      }
      else if (data.actionType === 'assign_agent') {
        if (data.agentId) {
          await this.prisma.conversation.update({
            where: { id: context.conversation.id },
            data: { assignedToId: data.agentId },
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error executing action node ${node.id}: ${error.message}`);
    }
  }

  private async sendWhatsAppMessage(phoneNumberId: string, to: string, text: string) {
    const token = process.env.META_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    
    await firstValueFrom(
      this.httpService.post(url, {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: text }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    );
  }

  private async saveAndEmitMessage(clientId: string, conversationId: string, text: string) {
    const savedMsg = await this.prisma.message.create({
      data: {
        conversationId,
        content: text,
        type: 'text',
        direction: 'OUTBOUND',
        status: 'SENT',
      }
    });

    this.chatGateway.emitNewMessage(clientId, {
      id: savedMsg.id,
      conversationId,
      content: text,
      direction: savedMsg.direction,
      status: savedMsg.status,
      createdAt: savedMsg.createdAt,
    });
  }
}
