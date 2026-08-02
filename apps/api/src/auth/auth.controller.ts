import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Request() req: any, @Body() body: any) {
    if (body.name) {
      await this.usersService.update(req.user.userId, { name: body.name });
    }
    const user = await this.usersService.findById(req.user.userId);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
