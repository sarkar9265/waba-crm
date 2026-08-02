import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { firebaseAuth } from './firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      
      // Find the user in our database
      const user = await this.usersService.findByEmail(decodedToken.email);
      
      if (!user) {
        // Automatically sync/create user if they logged in via Firebase successfully
        // but don't exist in our DB yet.
        const newUser = await this.usersService.create({
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split('@')[0],
          password: '', // Firebase handles password
        });
        request.user = { userId: newUser.id, email: newUser.email, role: newUser.role, clientId: newUser.clientId };
      } else {
        request.user = { userId: user.id, email: user.email, role: user.role, clientId: user.clientId };
      }
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
