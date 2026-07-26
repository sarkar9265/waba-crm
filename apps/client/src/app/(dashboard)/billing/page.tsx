"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@algo-matrix/ui";
import { CheckCircle2, Zap, Shield, Rocket, Download, History, CreditCard } from "lucide-react";
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for small businesses getting started with WhatsApp.",
    price: 999, // INR
    icon: <Zap className="h-6 w-6 text-[var(--primary)]" />,
    features: [
      "1,000 Conversations / month",
      "Shared Inbox for 2 Agents",
      "Basic Analytics",
      "Standard Support"
    ],
    highlight: false
  },
  {
    name: "Pro",
    description: "Ideal for growing teams needing automation and campaigns.",
    price: 2999, // INR
    icon: <Rocket className="h-6 w-6 text-[var(--primary)]" />,
    features: [
      "10,000 Conversations / month",
      "Shared Inbox for 10 Agents",
      "AI Chatbot Integration",
      "Campaigns & Broadcasts",
      "Priority Support"
    ],
    highlight: true
  },
  {
    name: "Enterprise",
    description: "For large organizations with complex workflow needs.",
    price: 9999, // INR
    icon: <Shield className="h-6 w-6 text-white" />,
    features: [
      "Unlimited Conversations",
      "Unlimited Agents",
      "Custom AI Models (Knowledge Base)",
      "Dedicated Account Manager",
      "SLA 99.9% Uptime"
    ],
    highlight: false
  }
];

export default function BillingPage() {
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  
  const [subscription, setSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = useAuthStore((state) => state.user);

  const fetchBillingData = async () => {
    try {
      const [subRes, histRes] = await Promise.all([
        api.get('/billing/subscription'),
        api.get('/billing/history')
      ]);
      setSubscription(subRes.data);
      setHistory(histRes.data);
    } catch (error) {
      console.error("Failed to fetch billing data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (plan: typeof PLANS[0]) => {
    if (!isRazorpayLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }
    
    setLoadingPlan(plan.name);

    try {
      // 1. Create order on backend via authenticated API
      const { data: order } = await api.post('/billing/create-order', {
        planName: plan.name,
        gateway: 'RAZORPAY',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: order.keyId, // Use the key returned from backend
        amount: order.amount,
        currency: order.currency,
        name: "Algo Matrix",
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment server-side via authenticated endpoint
            await api.post('/billing/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`Successfully subscribed to ${plan.name} plan!`);
            fetchBillingData();
          } catch (e) {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: "#13b77a"
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        console.error(response.error);
        toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);  
      });
      rzp1.open();

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const res = await api.get(`/billing/invoice/${invoiceId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const res = await api.get(`/billing/coupon/${couponCode}`);
      setAppliedCoupon(res.data);
    } catch (e: any) {
      setCouponError(e.response?.data?.message || 'Invalid Coupon');
      setAppliedCoupon(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--muted-foreground)]">Loading billing info...</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
          <p className="text-[var(--muted-foreground)]">Manage your plan and payment history</p>
        </div>
        
        {subscription?.status === 'ACTIVE' && (
          <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <div className="font-semibold">{subscription.plan?.name || 'Pro'} Plan Active</div>
              <div className="text-xs opacity-80">Renews on {new Date(subscription.expiresAt).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-1 bg-[var(--card)] p-1 rounded-lg w-max border border-[var(--border)]">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'plans' ? 'bg-[var(--primary)] text-primary-foreground' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
        >
          <CreditCard className="w-4 h-4 inline-block mr-2" />
          Plans
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-[var(--primary)] text-primary-foreground' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
        >
          <History className="w-4 h-4 inline-block mr-2" />
          Payment History
        </button>
      </div>

      {activeTab === 'plans' && (
        <>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)] mb-6 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Discount Coupon</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Enter Code"
                  className="px-3 py-2 border rounded-md bg-transparent"
                />
                <Button variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
              {appliedCoupon && <p className="text-emerald-500 text-sm mt-1">Coupon {appliedCoupon.code} applied ({appliedCoupon.discountPercent}% off)!</p>}
              {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-6">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${
                plan.highlight 
                  ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20 bg-[var(--background)]' 
                  : 'border-[var(--border)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${plan.name === 'Enterprise' ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-[var(--primary)]/10'}`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-2 min-h-[3.5rem] flex items-start justify-center">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col pt-4">
                <div className="text-center mb-8">
                  <span className="text-4xl font-extrabold">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-[var(--muted-foreground)]">/mo</span>
                </div>
                
                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[var(--primary)] shrink-0" />
                      <span className="text-sm text-[var(--foreground)]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-8 mt-auto">
                  {appliedCoupon && (
                    <div className="text-xs text-[var(--muted-foreground)] mb-2 text-center">
                      Subtotal: ₹{(plan.price - (plan.price * appliedCoupon.discountPercent / 100)).toLocaleString('en-IN')} <br/>
                      + 18% GST: ₹{((plan.price - (plan.price * appliedCoupon.discountPercent / 100)) * 0.18).toLocaleString('en-IN')} <br/>
                      Total: ₹{((plan.price - (plan.price * appliedCoupon.discountPercent / 100)) * 1.18).toLocaleString('en-IN')}
                    </div>
                  )}
                  {!appliedCoupon && (
                    <div className="text-xs text-[var(--muted-foreground)] mb-2 text-center">
                      + 18% GST: ₹{(plan.price * 0.18).toLocaleString('en-IN')} <br/>
                      Total: ₹{(plan.price * 1.18).toLocaleString('en-IN')}
                    </div>
                  )}
                  <Button 
                    className={`w-full ${plan.highlight ? '' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                No past transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--muted)]">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Date</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Transaction ID</th>
                      <th className="px-6 py-3 rounded-tr-lg">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx) => (
                      <tr key={tx.id} className="border-b border-[var(--border)]">
                        <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">₹{tx.amount}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted-foreground)] font-mono text-xs">
                          {tx.razorpayPaymentId || tx.id}
                        </td>
                        <td className="px-6 py-4">
                          {tx.invoice ? (
                            <Button variant="outline" size="sm" onClick={() => downloadInvoice(tx.invoice.id)}>
                              <Download className="w-4 h-4 mr-2" /> PDF
                            </Button>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
