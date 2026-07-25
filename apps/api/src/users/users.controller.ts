import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionLimitGuard } from '../billing/subscription-limit.guard';
import { Role } from '@algo-matrix/database';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users (Team)')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, SubscriptionLimitGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== Role.CLIENT_OWNER && req.user.role !== Role.CLIENT_ADMIN) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }
  }

  @ApiOperation({ summary: 'List all users in the workspace' })
  @Get()
  async findAll(@Request() req: any) {
    return this.usersService.findAllByTenant(req.user.clientId);
  }

  @ApiOperation({ summary: 'Invite a new user to the workspace' })
  @Post()
  async create(@Request() req: any, @Body() data: { email: string; name?: string; role?: Role; password?: string }) {
    this.checkAdmin(req);
    return this.usersService.create({ ...data, clientId: req.user.clientId }, req.user.id);
  }

  @ApiOperation({ summary: 'Update a user role' })
  @Patch(':id/role')
  async updateRole(@Request() req: any, @Param('id') id: string, @Body() data: { role: Role }) {
    this.checkAdmin(req);
    return this.usersService.updateRole(req.user.clientId, id, data.role, req.user.id);
  }

  @ApiOperation({ summary: 'Remove a user from the workspace' })
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.usersService.delete(req.user.clientId, id, req.user.id);
  }
}
