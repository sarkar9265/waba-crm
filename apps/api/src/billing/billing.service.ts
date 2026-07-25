import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import PDFDocument from 'pdfkit';
import axios from 'axios';

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

  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
      return null;
    }
    return coupon;
  }

  async getHistory(clientId: string) {
    return this.prisma.transaction.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { invoice: true },
    });
  }

  async createOrder(clientId: string, planName: string, amount: number, gateway: string = 'RAZORPAY', couponCode?: string) {
    let finalAmount = amount;
    let appliedCoupon: any = null;

    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        finalAmount = amount - (amount * (coupon.discountPercent / 100));
        appliedCoupon = coupon;
      } else {
        throw new HttpException('Invalid or expired coupon', HttpStatus.BAD_REQUEST);
      }
    }

    // Always apply 18% GST on the final discounted amount
    const gstAmount = finalAmount * 0.18;
    const totalPayable = finalAmount + gstAmount;

    if (gateway === 'RAZORPAY') {
      if (!this.razorpay) throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);

      try {
        const options = {
          amount: Math.round(totalPayable * 100), // Razorpay expects amount in paise
          currency: "INR",
          receipt: `receipt_${clientId}_${Date.now()}`,
          notes: {
            clientId,
            planName,
            subtotal: finalAmount,
            tax: gstAmount,
            discount: appliedCoupon ? (amount - finalAmount) : 0,
            gateway: 'RAZORPAY'
          }
        };

        const order = await this.razorpay.orders.create(options);
        
        this.logger.log(`Created Razorpay order ${order.id} for client ${clientId} (Plan: ${planName})`);
        
        return {
          id: order.id,
          currency: order.currency,
          amount: order.amount, // in paise
          subtotal: finalAmount,
          tax: gstAmount,
          total: totalPayable
        };
      } catch (error) {
        this.logger.error('Failed to create Razorpay order', error);
        throw new HttpException('Failed to initiate payment', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else if (gateway === 'PAYTM') {
      // Mock Paytm Order Creation
      const orderId = `PAYTM_${clientId}_${Date.now()}`;
      return {
        id: orderId,
        currency: "INR",
        amount: Math.round(totalPayable), // Paytm usually takes exact amounts or strings
        subtotal: finalAmount,
        tax: gstAmount,
        total: totalPayable,
        provider: 'PAYTM'
      };
    } else {
      throw new HttpException('Unsupported payment gateway', HttpStatus.BAD_REQUEST);
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
    // For Razorpay
    if (payload.razorpay_order_id) {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, clientId, planName, amount, subtotal, tax, discount } = payload;
      
      const isValid = this.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) throw new HttpException('Invalid payment signature', HttpStatus.BAD_REQUEST);

      const existingTx = await this.prisma.transaction.findUnique({ where: { razorpayPaymentId: razorpay_payment_id } });
      if (existingTx) return { status: 'already_processed' };

      await this.completePaymentTransaction({
        clientId, planName, amount, gateway: 'RAZORPAY',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        subtotal, tax, discount
      });
      return { status: 'success' };
    } 
    // For Paytm (Mocked)
    else if (payload.paytm_order_id) {
      const { paytm_order_id, paytm_transaction_id, clientId, planName, amount, subtotal, tax, discount } = payload;
      
      const existingTx = await this.prisma.transaction.findUnique({ where: { paytmTransactionId: paytm_transaction_id } });
      if (existingTx) return { status: 'already_processed' };

      await this.completePaymentTransaction({
        clientId, planName, amount, gateway: 'PAYTM',
        paytmOrderId: paytm_order_id,
        paytmTransactionId: paytm_transaction_id,
        subtotal, tax, discount
      });
      return { status: 'success' };
    } else {
      throw new HttpException('Unknown payload structure', HttpStatus.BAD_REQUEST);
    }
  }

  private async completePaymentTransaction(data: any) {
    const { 
      clientId, planName, amount, gateway, 
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      paytmOrderId, paytmTransactionId,
      subtotal, tax, discount 
    } = data;

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        status: 'SUCCESS',
        gateway,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paytmOrderId,
        paytmTransactionId,
        clientId,
      }
    });

    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        transactionId: transaction.id,
        subtotal: parseFloat(subtotal) || parseFloat(amount),
        taxAmount: parseFloat(tax) || 0,
        discountAmount: parseFloat(discount) || 0,
        total: parseFloat(amount)
      }
    });

    // Zoho Books Integration Mock
    try {
      this.logger.log(`[Zoho Books] Creating invoice ${invoiceNumber} for client ${clientId}...`);
      // const zohoRes = await axios.post('https://books.zoho.in/api/v3/invoices', { ... }, { headers: { Authorization: 'Zoho-oauthtoken ...' } });
      this.logger.log(`[Zoho Books] Invoice created successfully in Zoho Books.`);
    } catch (e) {
      this.logger.error(`[Zoho Books] Failed to create invoice`, e);
    }

    // Ensure plan exists
    let plan = await this.prisma.plan.findFirst({ where: { name: planName } });
    if (!plan) {
      plan = await this.prisma.plan.create({
        data: { name: planName, price: parseFloat(amount) }
      });
    }

    const existingSub = await this.prisma.subscription.findFirst({ where: { clientId } });
    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

    this.logger.log(`Payment successful for client ${clientId}`);
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
      doc.text(`INR ${invoice.subtotal}`, 450, doc.y);
      doc.moveDown(1.5);
      
      if (invoice.discountAmount && invoice.discountAmount > 0) {
        doc.text(`Discount`, 60, doc.y);
        doc.text(`- INR ${invoice.discountAmount}`, 450, doc.y);
        doc.moveDown(1);
      }

      doc.text(`GST (18% IGST)`, 60, doc.y);
      doc.text(`INR ${invoice.taxAmount}`, 450, doc.y);
      doc.moveDown(2);

      // Total Line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`Total Paid: INR ${invoice.total}`, { align: 'right' });
      doc.font('Helvetica');
      
      doc.moveDown(4);
      doc.fontSize(10).fillColor('gray').text('Thank you for your business!', { align: 'center' });
      
      doc.end();
    });
  }
}
