import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@algo-matrix/database';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  private checkAdmin(req: any) {
    const role = req.user.role;
    if (role !== Role.CLIENT_OWNER && role !== Role.CLIENT_ADMIN && role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only administrators can access audit logs');
    }
  }

  @ApiOperation({ summary: 'Get workspace audit logs' })
  @Get()
  async getLogs(@Request() req: any) {
    this.checkAdmin(req);
    return this.auditLogService.getWorkspaceLogs(req.user.clientId);
  }
}
