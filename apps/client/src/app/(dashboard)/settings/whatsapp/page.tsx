"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@algo-matrix/ui";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";

export default function WhatsAppSettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleMetaLogin = () => {
    setIsConnecting(true);
    
    // In a real scenario, this is where we invoke the FB.login() SDK
    // with the specific scopes required for Embedded Signup.
    // e.g. FB.login(callback, { scopes: 'whatsapp_business_management,whatsapp_business_messaging' })
    
    // Simulating the popup and redirect delay
    setTimeout(() => {
      // Upon successful Meta login, we would take the OAuth code and 
      // send it to our NestJS backend to exchange it for a System User token.
      
      // Simulating successful connection
      setConnected(true);
      setIsConnecting(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">WhatsApp Integration</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Connect your WhatsApp Business Account (WABA) to Algo Matrix.</p>
      </div>

      {!connected ? (
        <Card className="border-[var(--border)] overflow-hidden">
          <div className="bg-[var(--accent)]/50 p-8 text-center flex flex-col items-center justify-center border-b border-[var(--border)]">
            <div className="h-16 w-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Connect to WhatsApp</h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
              Use Meta's Embedded Signup to quickly link your existing WhatsApp Business Account or create a new one instantly.
            </p>
            <Button 
              onClick={handleMetaLogin}
              disabled={isConnecting}
              className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white gap-2 font-medium"
            >
              {isConnecting ? (
                "Connecting..."
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Login with Facebook
                </>
              )}
            </Button>
          </div>
          <CardContent className="p-6">
            <h3 className="font-semibold text-sm mb-4">What you'll need:</h3>
            <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <span>Admin access to your Meta Business Manager</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <span>A valid phone number not currently registered with the WhatsApp consumer app</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <span>Your business legal details and website</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[var(--primary)]/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]" />
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Algo Matrix Support
                  <Badge variant="outline" className="text-[#25D366] border-[#25D366] bg-[#25D366]/10">Connected</Badge>
                </CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">WABA ID: 104928475930281</p>
              </div>
              <Button variant="outline" size="sm">Manage on Meta</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Display Phone Number</div>
                <div className="font-semibold">+1 (555) 019-2834</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">Phone ID: 8472938475</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted-foreground)] mb-1">Quality Rating</div>
                <div className="font-semibold text-[#25D366]">High</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">Tier: 1K msgs/day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
