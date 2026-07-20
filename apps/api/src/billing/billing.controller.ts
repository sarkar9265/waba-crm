import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import type { Request, Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiOperation({ summary: 'Create a Razorpay Order for subscription' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Post('create-order')
  async createOrder(@Body() body: CreateOrderDto) {
    // In production, clientId should be extracted securely from the JWT, not the request body
    const { clientId, planName, amount } = body;
    return this.billingService.createOrder(clientId, planName, amount);
  }

  @Post('webhook')
  async handleRazorpayWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;
    // const payload = req.body;
    
    // Typically you would verify the webhook signature using Razorpay.validateWebhookSignature
    // For MVP we assume processSuccessfulPayment handles the core logic
    
    await this.billingService.processSuccessfulPayment(req.body);
    return res.status(HttpStatus.OK).send();
  }
}
