"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@algo-matrix/ui";
import { CheckCircle2, Zap, Shield, Rocket, Download, History, CreditCard } from "lucide-react";
import { api } from '@/lib/api';

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
  
  const [subscription, setSubscription] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }
    
    setLoadingPlan(plan.name);

    try {
      // 1. Create order on backend via authenticated API
      const { data: order } = await api.post('/billing/create-order', {
        planName: plan.name,
        amount: plan.price
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mocked", // Use appropriate environment variable
        amount: order.amount,
        currency: order.currency,
        name: "Algo Matrix",
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Post to webhook manually if needed, or rely on Razorpay webhook
            await api.post('/billing/webhook', response);
            alert(`Successfully subscribed to ${plan.name} plan!`);
            fetchBillingData(); // refresh
          } catch (e) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: "Client Admin",
          email: "admin@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#059669"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        console.error(response.error);
        alert("Payment failed. Please try again.");
      });
      rzp1.open();

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout");
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
      alert("Failed to download invoice");
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
        <div className="grid md:grid-cols-3 gap-8 pt-4">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative flex flex-col ${
                plan.highlight 
                  ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 scale-105 z-10 bg-[var(--background)]' 
                  : 'border-[var(--border)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4">
                  <span className="bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${plan.name === 'Enterprise' ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-[var(--primary)]/10'}`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-2 h-10">{plan.description}</p>
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
                  <Button 
                    className={`w-full ${plan.highlight ? '' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? 'Processing...' : 'Subscribe'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
