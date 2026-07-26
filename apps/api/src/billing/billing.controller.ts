import { Controller, Get, Post, Body, Req, Res, HttpStatus, UseGuards, Param, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as crypto from 'crypto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  
  constructor(private readonly billingService: BillingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    return this.billingService.getSubscription(req.user.clientId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.billingService.getHistory(req.user.clientId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a Razorpay Order for subscription' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Post('create-order')
  async createOrder(@Req() req: any, @Body() body: { planName: string, gateway?: string, couponCode?: string }) {
    const { planName, gateway, couponCode } = body;
    return this.billingService.createOrder(req.user.clientId, planName, gateway, couponCode);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify a completed Razorpay checkout' })
  @Post('verify')
  async verifyPayment(@Req() req: any, @Body() body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.billingService.verifyPayment(req.user.clientId, body);
  }

  // Razorpay server-to-server webhook — no JWT auth, verified by signature
  @Post('webhook')
  async handleRazorpayWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      // Verify Razorpay webhook signature
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody;

      if (webhookSecret && rawBody) {
        if (!signature) {
          this.logger.warn('Razorpay webhook received without signature header');
          return res.status(HttpStatus.UNAUTHORIZED).send('Missing signature');
        }

        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(rawBody)
          .digest('hex');

        if (signature !== expectedSignature) {
          this.logger.warn('Razorpay webhook signature verification failed');
          return res.status(HttpStatus.UNAUTHORIZED).send('Invalid signature');
        }
      } else if (!webhookSecret) {
        this.logger.warn('RAZORPAY_WEBHOOK_SECRET not configured — webhook signature verification skipped');
      }

      await this.billingService.processSuccessfulPayment(req.body);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('coupon/:code')
  async validateCoupon(@Param('code') code: string) {
    const coupon = await this.billingService.validateCoupon(code);
    if (!coupon) throw new HttpException('Invalid or expired coupon', HttpStatus.BAD_REQUEST);
    return coupon;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('invoice/:id/download')
  async downloadInvoice(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.billingService.generateInvoicePdf(id, req.user.clientId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to generate PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
