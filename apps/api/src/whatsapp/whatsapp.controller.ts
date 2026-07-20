import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import type { Response, Request } from 'express';

@Controller('webhook/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

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
  @Post('oauth')
  async handleOAuthCode(@Body('code') code: string, @Req() req: any) {
    // In a real app, req.user.clientId would be populated by ClerkAuthGuard
    const clientId = req.user?.clientId || 'mock_client_id';
    
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

  /**
   * Endpoint to receive incoming WhatsApp messages and events
   */
  @Post()
  async handleIncomingMessage(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    this.logger.log('Received WhatsApp Webhook event');

    // Ensure it's a WhatsApp API event
    if (body.object === 'whatsapp_business_account') {
      try {
        // Send OK response immediately to Meta (must respond within 20s)
        res.sendStatus(HttpStatus.OK);
        
        // Process the payload asynchronously
        await this.whatsappService.processWebhookPayload(body);
      } catch (error) {
        this.logger.error(`Error processing webhook: ${error.message}`);
        // If we didn't already send a response, we'd send a 500 here, 
        // but Meta expects a 200 to acknowledge receipt regardless of processing success.
      }
    } else {
      res.sendStatus(HttpStatus.NOT_FOUND);
    }
  }
}
