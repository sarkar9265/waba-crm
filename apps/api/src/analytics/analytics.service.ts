import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(clientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeConversations,
      totalContacts,
      activeCampaigns,
      messagesToday,
      closedConversations,
      pendingConversations,
      newContacts,
      revenueResult,
      activeAgents,
      campaignPerf,
    ] = await Promise.all([
      // Active (OPEN) conversations
      this.prisma.conversation.count({
        where: { clientId, status: 'OPEN' },
      }),
      
      // Total contacts
      this.prisma.contact.count({
        where: { clientId },
      }),

      // Active campaigns (RUNNING)
      this.prisma.campaign.count({
        where: { clientId, status: 'RUNNING' },
      }),

      // Messages sent today
      this.prisma.message.count({
        where: {
          conversation: { clientId },
          createdAt: { gte: today },
        },
      }),

      // Closed conversations
      this.prisma.conversation.count({
        where: { clientId, status: 'CLOSED' },
      }),

      // Pending conversations
      this.prisma.conversation.count({
        where: { clientId, status: 'OPEN', unreadCount: { gt: 0 } },
      }),

      // New contacts today
      this.prisma.contact.count({
        where: { clientId, createdAt: { gte: today } },
      }),

      // Revenue (sum of successful transactions)
      this.prisma.transaction.aggregate({
        where: { clientId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),

      // Active Agents
      this.prisma.user.count({
        where: { clientId, role: 'AGENT' },
      }),

      // Campaign Performance (sum of all metrics)
      this.prisma.campaign.aggregate({
        where: { clientId },
        _sum: { sent: true, delivered: true, read: true, failed: true },
      })
    ]);

    return {
      activeConversations,
      totalContacts,
      activeCampaigns,
      messagesToday,
      closedConversations,
      pendingConversations,
      newContacts,
      revenue: revenueResult._sum.amount || 0,
      activeAgents,
      campaignPerformance: {
        sent: campaignPerf._sum.sent || 0,
        delivered: campaignPerf._sum.delivered || 0,
        read: campaignPerf._sum.read || 0,
        failed: campaignPerf._sum.failed || 0,
      }
    };
  }

  async getCharts(clientId: string) {
    // Return last 7 days of message stats
    const chartData: any[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      // We should ideally use a raw query with GROUP BY for performance, 
      // but we use simple await counts here to simplify since this is a demo.
      const inbound = await this.prisma.message.count({
        where: {
          conversation: { clientId },
          direction: 'INBOUND',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          }
        }
      });

      const outbound = await this.prisma.message.count({
        where: {
          conversation: { clientId },
          direction: 'OUTBOUND',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          }
        }
      });

      // Fetch extra stats for rates
      const delivered = await this.prisma.message.count({
        where: {
          conversation: { clientId },
          direction: 'OUTBOUND',
          status: 'DELIVERED',
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      const read = await this.prisma.message.count({
        where: {
          conversation: { clientId },
          direction: 'OUTBOUND',
          status: 'READ',
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      // Calculate mock response time (since we don't have explicit timestamps stored for this logic)
      const responseTime = Math.floor(Math.random() * 15) + 1; // 1 to 15 mins
      
      // Calculate mock ROI based on a simple heuristic for demonstration
      const campaignRoi = Math.floor(Math.random() * 50) + 10; // 10% to 60%

      chartData.push({
        name: days[d.getDay()],
        messages: inbound + outbound,
        inbound,
        outbound,
        deliveryRate: outbound > 0 ? (delivered / outbound) * 100 : 0,
        readRate: outbound > 0 ? (read / outbound) * 100 : 0,
        replyRate: outbound > 0 ? (inbound / outbound) * 100 : 0,
        responseTime,
        campaignRoi,
      });
    }

    return chartData;
  }

  async getActiveCampaigns(clientId: string) {
    return this.prisma.campaign.findMany({
      where: {
        clientId,
        status: {
          in: ['RUNNING', 'PAUSED']
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 3
    });
  }

  async getAgentLeaderboard(clientId: string) {
    const agents = await this.prisma.user.findMany({
      where: {
        clientId,
        role: 'AGENT',
      },
      select: {
        id: true,
        name: true,
        assignedChats: {
          where: {
            status: 'CLOSED'
          }
        }
      }
    });

    const leaderboard = agents.map(agent => {
      // Mocking CSAT between 85% and 100% since it's not in the DB
      const csat = Math.floor(Math.random() * (100 - 85 + 1)) + 85; 
      return {
        name: agent.name || 'Unknown Agent',
        solved: agent.assignedChats.length,
        csat
      };
    });

    return leaderboard.sort((a, b) => b.solved - a.solved);
  }
}
