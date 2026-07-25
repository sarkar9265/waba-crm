import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clientId = request.user?.clientId;
    
    if (!clientId) return true; // Let standard Auth guard handle missing user

    const routePath = request.route.path;
    const method = request.method;

    if (method !== 'POST') return true; // Only block creations for now

    const subscription = await this.prisma.subscription.findFirst({
      where: { clientId },
      include: { plan: true }
    });

    // Default Fallback limits if no plan
    const maxContacts = subscription?.plan?.maxContacts || 100;
    const maxCampaigns = subscription?.plan?.maxCampaigns || 1;
    const maxAgents = subscription?.plan?.maxAgents || 1;

    if (routePath.includes('/contacts')) {
      const currentContacts = await this.prisma.contact.count({ where: { clientId } });
      if (currentContacts >= maxContacts) {
        throw new HttpException(`Plan limit reached: You can only have ${maxContacts} contacts. Please upgrade your plan.`, HttpStatus.FORBIDDEN);
      }
    }

    if (routePath.includes('/campaigns')) {
      const currentCampaigns = await this.prisma.campaign.count({ where: { clientId } });
      if (currentCampaigns >= maxCampaigns) {
        throw new HttpException(`Plan limit reached: You can only have ${maxCampaigns} campaigns. Please upgrade your plan.`, HttpStatus.FORBIDDEN);
      }
    }

    if (routePath.includes('/team') || routePath.includes('/users')) {
      const currentAgents = await this.prisma.user.count({ where: { clientId, role: 'AGENT' } });
      if (currentAgents >= maxAgents) {
        throw new HttpException(`Plan limit reached: You can only have ${maxAgents} agents. Please upgrade your plan.`, HttpStatus.FORBIDDEN);
      }
    }

    return true;
  }
}
