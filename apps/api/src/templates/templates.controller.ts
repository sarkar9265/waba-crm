import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll(@Request() req: any, @Query() query: any) {
    return this.templatesService.findAll(req.user.clientId, query);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.findOne(req.user.clientId, id);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.templatesService.create(req.user.clientId, data);
  }

  @Delete(':id')
  delete(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.delete(req.user.clientId, id);
  }

  @Post(':id/sync')
  syncWithMeta(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.syncWithMeta(req.user.clientId, id);
  }
}
