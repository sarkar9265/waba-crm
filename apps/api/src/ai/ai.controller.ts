import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai/config')
export class AiController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getConfig(@Request() req: any) {
    const client = await this.prisma.client.findUnique({
      where: { id: req.user.clientId },
      select: { aiEnabled: true, aiSystemPrompt: true },
    });
    
    return client || { aiEnabled: false, aiSystemPrompt: '' };
  }

  @Post()
  async updateConfig(
    @Request() req: any,
    @Body() body: { aiEnabled: boolean; aiSystemPrompt: string },
  ) {
    const updated = await this.prisma.client.update({
      where: { id: req.user.clientId },
      data: {
        aiEnabled: body.aiEnabled,
        aiSystemPrompt: body.aiSystemPrompt,
      },
      select: { aiEnabled: true, aiSystemPrompt: true },
    });
    
    return updated;
  }
}
