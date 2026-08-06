"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Tabs, TabsContent, TabsList, TabsTrigger, Badge } from "@algo-matrix/ui";
import { Save, UploadCloud, Building2, Globe, Phone, Hash, CheckCircle2, MessageCircle, Activity, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from "@/lib/store/useAuthStore";

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

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function SettingsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // WhatsApp connection states
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
    
    const initFb = () => {
      if ((window as any).FB) {
        (window as any).FB.init({
          appId: metaAppId,
          cookie: true,
          xfbml: true,
          version: 'v20.0',
        });
        setIsFbSdkLoaded(true);
      }
    };

    if ((window as any).FB) {
      initFb();
    } else {
      (window as any).fbAsyncInit = initFb;
      
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const { data: response } = await api.post('/storage/presigned-url', {
        fileName: file.name,
        mimeType: file.type,
      });

      const { url, key } = response.data || response;
      const axios = (await import('axios')).default;
      await axios.put(url, file, { headers: { 'Content-Type': file.type } });

      const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';
      const publicUrl = storageBaseUrl ? `${storageBaseUrl}/${key}` : key;
      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully!');
      
    } catch (error) {
      toast.error('Failed to upload avatar. Please check your storage configuration.');
    } finally {
      setIsUploading(false);
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
              toast.error(error?.response?.data?.message || "Failed to connect account.");
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
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your business profile and WhatsApp configuration.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Business API Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader className="border-b border-[var(--border)] pb-4">
              <CardTitle className="text-xl">Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-[var(--accent)] border-2 border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 text-[var(--muted-foreground)]" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <UploadCloud className="h-6 w-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium">Upload</span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-medium">Company Logo</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Recommended size: 256x256px (PNG or JPG). <br/>
                    {isUploading && <span className="text-[var(--primary)] font-medium">Uploading...</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input defaultValue="Algo Matrix Technologies" className="bg-[var(--accent)]/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input defaultValue="support@algomatrix.com" className="bg-[var(--accent)]/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input defaultValue="https://algomatrix.com" className="pl-9 bg-[var(--accent)]/50" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader className="border-b border-[var(--border)] pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">WhatsApp Business API Info</CardTitle>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Connect your WhatsApp Business Account (WABA) to Algo Matrix.</p>
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
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {accounts.length === 0 ? (
                <div className="bg-[var(--accent)]/50 p-8 text-center flex flex-col items-center justify-center rounded-lg border border-[var(--border)]">
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
                        <Facebook className="w-4 h-4 text-white" />
                        Login with Facebook
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-8 text-left max-w-sm">
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
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {accounts.map(account => (
                    <div key={account.id} className="border border-[var(--primary)]/20 shadow-sm relative overflow-hidden rounded-lg p-6">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {account.displayName || 'WhatsApp Account'}
                            <Badge variant="outline" className="text-[#25D366] border-[#25D366] bg-[#25D366]/10">
                              {account.status || 'CONNECTED'}
                            </Badge>
                          </h3>
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
                            className="gap-2 bg-red-500 hover:bg-red-600"
                            onClick={() => handleDisconnect(account.id)}
                            disabled={isDisconnecting === account.id}
                          >
                            {isDisconnecting === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Disconnect WhatsApp API
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/> Phone Number ID</label>
                          <Input readOnly value={account.phoneNumberId || ''} className="bg-[var(--accent)]/50 font-mono text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground"/> Display Phone Number</label>
                          <Input readOnly value={account.displayPhoneNumber || ''} className="bg-[var(--accent)]/50 font-mono text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">Quality Rating</label>
                          <div className={`font-semibold text-sm ${account.qualityRating === 'GREEN' ? 'text-[#25D366]' : account.qualityRating === 'YELLOW' ? 'text-yellow-500' : 'text-red-500'}`}>
                            {account.qualityRating || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-center border-t border-[var(--border)]">
                    <Button variant="outline" className="gap-2 text-[var(--muted-foreground)]" onClick={handleMetaLogin}>
                      Connect Another Number
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
