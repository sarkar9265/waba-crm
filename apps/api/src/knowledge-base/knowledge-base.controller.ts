import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Post()
  create(@Request() req: any, @Body() data: { title: string; content: string; isActive?: boolean }) {
    return this.kbService.create(req.user.clientId, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.kbService.findAll(req.user.clientId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.kbService.findOne(req.user.clientId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() data: { title?: string; content?: string; isActive?: boolean }
  ) {
    return this.kbService.update(req.user.clientId, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.kbService.remove(req.user.clientId, id);
  }
}
