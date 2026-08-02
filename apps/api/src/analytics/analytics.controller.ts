import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('metrics')
  getMetrics(@Request() req: any) {
    if (!req.user.clientId) throw new UnauthorizedException('User is not associated with any client/tenant');
    return this.analyticsService.getMetrics(req.user.clientId);
  }

  @Get('charts')
  getCharts(@Request() req: any) {
    if (!req.user.clientId) throw new UnauthorizedException('User is not associated with any client/tenant');
    return this.analyticsService.getCharts(req.user.clientId);
  }

  @Get('campaigns')
  getCampaigns(@Request() req: any) {
    if (!req.user.clientId) throw new UnauthorizedException('User is not associated with any client/tenant');
    return this.analyticsService.getActiveCampaigns(req.user.clientId);
  }

  @Get('agents')
  getAgents(@Request() req: any) {
    if (!req.user.clientId) throw new UnauthorizedException('User is not associated with any client/tenant');
    return this.analyticsService.getAgentLeaderboard(req.user.clientId);
  }
}
