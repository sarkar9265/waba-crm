import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionLimitGuard } from '../billing/subscription-limit.guard';

@UseGuards(JwtAuthGuard, SubscriptionLimitGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  findAll(@Request() req: any, @Query() query: any) {
    return this.campaignService.findAll(req.user.clientId, query);
  }

  @Get('queue-status')
  getQueueStatus(@Request() req: any) {
    return this.campaignService.getQueueStatus(req.user.clientId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.findOne(req.user.clientId, id);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.campaignService.create(req.user.clientId, data);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.campaignService.update(req.user.clientId, id, data);
  }

  @Post(':id/launch')
  launch(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.launch(req.user.clientId, id);
  }

  @Post(':id/pause')
  pause(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.pause(req.user.clientId, id);
  }

  @Post(':id/resume')
  resume(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.resume(req.user.clientId, id);
  }

  @Post(':id/retry')
  retry(@Request() req: any, @Param('id') id: string) {
    return this.campaignService.retry(req.user.clientId, id);
  }
}
