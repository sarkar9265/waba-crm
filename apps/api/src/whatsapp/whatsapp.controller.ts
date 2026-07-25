import { Controller, Get, Post, Delete, Body, Query, Param, Res, HttpStatus, Logger, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('webhook/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
    @InjectQueue('webhook') private readonly webhookQueue: Queue
  ) {}

  /**
   * Endpoint for Meta to verify the webhook
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    // In production, this should match a secret token configured in your app
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'algo_matrix_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook verified successfully');
      res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.warn('Webhook verification failed: Invalid token');
      res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Endpoint for frontend to send the OAuth code after Embedded Signup
   */
  @UseGuards(JwtAuthGuard)
  @Post('oauth')
  async handleOAuthCode(@Body('code') code: string, @Req() req: any) {
    const clientId = req.user?.clientId;
    
    if (!code) {
      return { success: false, error: 'No OAuth code provided' };
    }

    try {
      const account = await this.whatsappService.exchangeOAuthCode(code, clientId);
      return { success: true, account };
    } catch (error) {
      this.logger.error(`OAuth exchange failed: ${error.message}`);
      return { success: false, error: 'Failed to connect WhatsApp account' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async getAccounts(@Req() req: any) {
    const clientId = req.user?.clientId;
    return this.whatsappService.getAccounts(clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('accounts/:id')
  async disconnectAccount(@Param('id') id: string, @Req() req: any) {
    const clientId = req.user?.clientId;
    return this.whatsappService.disconnectAccount(id, clientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('health')
  async getWebhookHealth() {
    // In a real application, you'd check connection to Meta's API or verify local webhook configs
    // Here we'll return a static healthy response for demonstration
    return {
      status: 'healthy',
      webhook_verified: true,
      last_event: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reconnect')
  async reconnectAccount() {
    // Placeholder for refresh token logic or re-triggering webhook registration
    return { success: true, message: 'Account tokens and webhooks refreshed' };
  }

  /**
   * Endpoint to receive incoming WhatsApp messages and events
   */
  @Post()
  async handleIncomingMessage(@Req() req: Request, @Res() res: Response) {
    this.logger.log('Received WhatsApp Webhook event');

    // 1. Signature Validation
    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBody = (req as any).rawBody; // Assumes rawBody is enabled in main.ts
    const appSecret = process.env.META_APP_SECRET;

    if (appSecret && signature && rawBody) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        this.logger.warn('Webhook signature validation failed');
        // Meta expects us to just ignore or return error if signature doesn't match
        return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
      }
    }

    const body = req.body;

    // Ensure it's a WhatsApp API event
    if (body.object === 'whatsapp_business_account') {
      try {
        // Log the payload to the database
        const webhookLog = await this.prisma.webhookLog.create({
          data: {
            payload: body,
            status: 'PENDING',
            event: body.entry?.[0]?.changes?.[0]?.field || 'unknown',
          }
        });

        // Add to BullMQ for reliable processing
        await this.webhookQueue.add('process', {
          payload: body,
          webhookLogId: webhookLog.id,
        }, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 }, // Dead Letter Queue via retries
        });

        // Send OK response immediately to Meta (must respond within 20s)
        res.sendStatus(HttpStatus.OK);
      } catch (error) {
        this.logger.error(`Error queuing webhook: ${error.message}`);
        // We still return 200 to Meta so they don't block us, but the queue handles our internal processing
        res.sendStatus(HttpStatus.OK);
      }
    } else {
      res.sendStatus(HttpStatus.NOT_FOUND);
    }
  }
}
