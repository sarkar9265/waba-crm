"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@algo-matrix/ui";
import { MessageCircle, CheckCircle2, AlertCircle, RefreshCw, Trash2, Loader2, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "sonner";

interface WabaAccount {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  displayName: string;
  qualityRating: string;
  status: string;
}

interface WebhookHealth {
  status: string;
  webhook_verified: boolean;
  last_event: string;
}

export default function WhatsAppSettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState<WabaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookHealth, setWebhookHealth] = useState<WebhookHealth | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  
  const { token } = useAuthStore();
  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
  const metaConfigId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

  // Load Facebook SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Define the callback for FB SDK
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: metaAppId,
        cookie: true,
        xfbml: true,
        version: 'v20.0',
      });
      setIsFbSdkLoaded(true);
    };

    // Load the SDK script if not already present
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if ((window as any).FB) {
      setIsFbSdkLoaded(true);
    }
  }, [metaAppId]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsRes, healthRes] = await Promise.all([
        api.get("/webhook/whatsapp/accounts"),
        api.get("/webhook/whatsapp/health")
      ]);
      setAccounts(accountsRes.data);
      setWebhookHealth(healthRes.data);
    } catch (error) {
      console.error("Failed to load WhatsApp data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetaLogin = async () => {
    const FB = (window as any).FB;
    
    if (!FB || !isFbSdkLoaded) {
      toast.error("Facebook SDK is not loaded. Please refresh and try again.");
      return;
    }

    if (!metaAppId) {
      toast.error("Meta App ID is not configured. Please contact support.");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Use Facebook Embedded Signup / Login dialog
      FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            
            try {
              await api.post("/webhook/whatsapp/oauth", { 
                code: accessToken,
                type: 'access_token', // Signal that this is a direct token, not an OAuth code
              });
              toast.success("WhatsApp account successfully connected!");
              fetchData();
            } catch (error: any) {
              toast.error(error.response?.data?.message || "Failed to connect account.");
            }
          } else {
            toast.error("Facebook login was cancelled or failed.");
          }
          setIsConnecting(false);
        },
        {
          // Required scopes for WhatsApp Business API
          scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
          extras: {
            feature: 'whatsapp_embedded_signup',
            ...(metaConfigId ? { setup: { solutionID: metaConfigId } } : {}),
          },
        }
      );
    } catch (error) {
      toast.error("Failed to open Facebook login dialog.");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp account? Messaging will stop working immediately.")) {
      return;
    }
    
    setIsDisconnecting(accountId);
    try {
      await api.delete(`/webhook/whatsapp/accounts/${accountId}`);
      toast.success("Account disconnected.");
      setAccounts(accounts.filter(a => a.id !== accountId));
    } catch (error) {
      toast.error("Failed to disconnect account.");
    } finally {
      setIsDisconnecting(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.post("/webhook/whatsapp/reconnect");
      toast.success("Tokens and webhook configurations refreshed.");
      fetchData();
    } catch (error) {
      toast.error("Refresh failed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">WhatsApp Integration</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Connect your WhatsApp Business Account (WABA) to Algo Matrix.</p>
        </div>
        
        {accounts.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm bg-[var(--accent)]/50 px-3 py-1.5 rounded-md border border-[var(--border)]">
              <Activity className={`h-4 w-4 ${webhookHealth?.webhook_verified ? 'text-[#25D366]' : 'text-red-500'}`} />
              <span className="font-medium text-[var(--muted-foreground)]">Webhook:</span>
              <span className={webhookHealth?.webhook_verified ? 'text-[#25D366] font-medium' : 'text-red-500 font-medium'}>
                {webhookHealth?.webhook_verified ? 'Healthy' : 'Disconnected'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {accounts.length === 0 ? (
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
                <Loader2 className="h-4 w-4 animate-spin" />
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
        <div className="space-y-4">
          {accounts.map(account => (
            <Card key={account.id} className="border-[var(--primary)]/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {account.displayName || 'WhatsApp Account'}
                      <Badge variant="outline" className="text-[#25D366] border-[#25D366] bg-[#25D366]/10">
                        {account.status || 'CONNECTED'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">WABA ID: {account.wabaId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/settings/whatsapp/${account.id}/profile`}>
                      <Button variant="outline" size="sm">
                        Manage Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={isDisconnecting === account.id}
                    >
                      {isDisconnecting === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">Display Phone Number</div>
                    <div className="font-semibold">{account.displayPhoneNumber || 'Unknown'}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">Phone ID: {account.phoneNumberId}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                    <div className="text-xs text-[var(--muted-foreground)] mb-1">Quality Rating</div>
                    <div className={`font-semibold ${account.qualityRating === 'GREEN' ? 'text-[#25D366]' : account.qualityRating === 'YELLOW' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {account.qualityRating || 'N/A'}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">Status: Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="pt-4 flex justify-center">
            <Button variant="outline" className="gap-2 text-[var(--muted-foreground)]" onClick={handleMetaLogin}>
              <PlusIcon className="h-4 w-4" />
              Connect Another Number
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
