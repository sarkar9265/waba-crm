import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private razorpay: any;

  constructor(private prisma: PrismaService) {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      this.logger.warn('Razorpay credentials not found in environment');
    }
  }

  /**
   * Creates a Razorpay Order for a specific subscription plan.
   */
  async createOrder(clientId: string, planName: string, amount: number) {
    if (!this.razorpay) {
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise (smallest currency unit)
        currency: "INR",
        receipt: `receipt_${clientId}_${Date.now()}`,
        notes: {
          clientId,
          planName
        }
      };

      const order = await this.razorpay.orders.create(options);
      
      this.logger.log(`Created Razorpay order ${order.id} for client ${clientId} (Plan: ${planName})`);
      
      return {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      };
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw new HttpException('Failed to initiate payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies the signature from Razorpay webhook or frontend success callback
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + "|" + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Processes a successful payment webhook
   */
  async processSuccessfulPayment(payload: any) {
    // 1. Validate Webhook Signature
    // 2. Extract Client ID and Plan from notes
    // 3. Update Database (Tenant Subscription status)
    this.logger.log('Payment successful, updating tenant subscription...', payload);
    return { status: 'success' };
  }
}
