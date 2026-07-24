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
      messagesToday
    ] = await Promise.all([
      // Active (OPEN) conversations
      this.prisma.conversation.count({
        where: {
          clientId,
          status: 'OPEN',
        },
      }),
      
      // Total contacts
      this.prisma.contact.count({
        where: { clientId },
      }),

      // Active campaigns (RUNNING)
      this.prisma.campaign.count({
        where: {
          clientId,
          status: 'RUNNING',
        },
      }),

      // Messages sent today
      this.prisma.message.count({
        where: {
          conversation: {
            clientId,
          },
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    return {
      activeConversations,
      totalContacts,
      activeCampaigns,
      messagesToday,
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

      chartData.push({
        name: days[d.getDay()],
        messages: inbound + outbound,
        inbound,
        outbound
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
    // Just returning a mock leaderboard for now as aggregating over relations
    // requires more complex Prisma queries
    return [
      { name: 'John Doe', solved: 45, csat: 98 },
      { name: 'Jane Smith', solved: 32, csat: 95 },
    ];
  }
}
