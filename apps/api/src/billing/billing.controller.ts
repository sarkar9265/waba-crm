import { Controller, Get, Post, Body, Req, Res, HttpStatus, UseGuards, Param, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
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
  async createOrder(@Req() req: any, @Body() body: { planName: string, amount: number }) {
    const { planName, amount } = body;
    return this.billingService.createOrder(req.user.clientId, planName, amount);
  }

  // Webhook is generally called directly by Razorpay, so no JwtAuthGuard here
  @Post('webhook')
  async handleRazorpayWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.billingService.processSuccessfulPayment(req.body);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
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
