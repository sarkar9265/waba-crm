import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import PDFDocument from 'pdfkit';

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

  async getSubscription(clientId: string) {
    return this.prisma.subscription.findFirst({
      where: { clientId },
      include: { plan: true },
    });
  }

  async getHistory(clientId: string) {
    return this.prisma.transaction.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { invoice: true },
    });
  }

  async createOrder(clientId: string, planName: string, amount: number) {
    if (!this.razorpay) {
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
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

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(orderId + "|" + paymentId)
      .digest('hex');

    return generatedSignature === signature;
  }

  async processSuccessfulPayment(payload: any) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, planName, amount } = payload;
    
    // 1. Validate Webhook Signature
    const isValid = this.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      throw new HttpException('Invalid payment signature', HttpStatus.BAD_REQUEST);
    }

    // 2. Check if already processed
    const existingTx = await this.prisma.transaction.findUnique({
      where: { razorpayPaymentId: razorpay_payment_id }
    });
    if (existingTx) return { status: 'already_processed' };

    // 3. Update Database (Transaction & Invoice)
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: amount,
        status: 'SUCCESS',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        clientId,
      }
    });

    await this.prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        clientId,
        transactionId: transaction.id,
      }
    });

    // Ensure plan exists
    let plan = await this.prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      plan = await this.prisma.plan.create({
        data: { name: planName, price: amount }
      });
    }

    // Update Subscription
    const existingSub = await this.prisma.subscription.findFirst({ where: { clientId } });
    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
        }
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          clientId,
          planId: plan.id,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    this.logger.log(`Payment successful for client ${clientId}, order: ${razorpay_order_id}`);
    return { status: 'success' };
  }

  async generateInvoicePdf(invoiceId: string, clientId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, clientId },
      include: { transaction: true, client: true }
    });

    if (!invoice) throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(24).text('INVOICE', { align: 'right' });
      doc.moveDown();
      
      doc.fontSize(12).text('Algo Matrix');
      doc.text('123 Tech Street, Suite 456');
      doc.text('San Francisco, CA 94107');
      doc.moveDown();

      doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${invoice.createdAt.toDateString()}`);
      doc.moveDown();

      doc.text(`Bill To:`);
      doc.text(`Client ID: ${invoice.client.id}`);
      if (invoice.client.name) doc.text(`Name: ${invoice.client.name}`);
      doc.moveDown(2);

      doc.rect(50, doc.y, 500, 20).fill('#f3f4f6');
      doc.fillColor('#000').text('Description', 60, doc.y - 15);
      doc.text('Amount', 450, doc.y - 15);
      
      doc.moveDown();
      doc.text(`WhatsApp Business Subscription`, 60, doc.y);
      doc.text(`INR ${invoice.transaction.amount}`, 450, doc.y);
      doc.moveDown(2);

      doc.text(`Total Paid: INR ${invoice.transaction.amount}`, { align: 'right' });
      
      doc.moveDown(4);
      doc.fontSize(10).fillColor('gray').text('Thank you for your business!', { align: 'center' });
      
      doc.end();
    });
  }
}
