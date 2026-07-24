"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@algo-matrix/ui";
import { CheckCircle2, Zap, Shield, Rocket } from "lucide-react";
import axios from 'axios';

// Razorpay SDK Types (typically imported from a types package, mocked for simplicity)
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

  useEffect(() => {
    // Dynamically load Razorpay SDK
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
      // 1. Create order on the NestJS backend
      const { data: order } = await axios.post('http://localhost:3001/billing/create-order', {
        clientId: 'mock_client_123', // In prod, this is derived from Auth context
        planName: plan.name,
        amount: plan.price
      });

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_Sm7GqBK0murDd2", // Usually passed from env
        amount: order.amount,
        currency: order.currency,
        name: "Algo Matrix",
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: function (response: any) {
          // 3. Handle success (In prod, backend webhook verifies this securely too)
          console.log(response.razorpay_payment_id);
          console.log(response.razorpay_order_id);
          console.log(response.razorpay_signature);
          alert(`Successfully subscribed to ${plan.name} plan!`);
        },
        prefill: {
          name: "Client Admin",
          email: "admin@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#059669" // Match the coral green theme
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

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Choose the plan that fits your business needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-8">
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
                  {loadingPlan === plan.name ? 'Processing...' : 'Choose Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
