import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  async getAutomations(@Req() req: any) {
    return this.automationService.getAutomations(req.user.clientId);
  }

  @Get(':id')
  async getAutomation(@Req() req: any, @Param('id') id: string) {
    return this.automationService.getAutomation(req.user.clientId, id);
  }

  @Post()
  async createAutomation(@Req() req: any, @Body() data: any) {
    return this.automationService.createAutomation(req.user.clientId, data);
  }

  @Put(':id')
  async updateAutomation(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.automationService.updateAutomation(req.user.clientId, id, data);
  }

  @Delete(':id')
  async deleteAutomation(@Req() req: any, @Param('id') id: string) {
    return this.automationService.deleteAutomation(req.user.clientId, id);
  }
}
