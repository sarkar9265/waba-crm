"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@algo-matrix/ui";
import { Save, UploadCloud, Building2, Globe, Phone, Key, Hash } from "lucide-react";
import { api } from '@/lib/api';
import { toast } from 'sonner';

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

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function SettingsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your business profile and WhatsApp configuration.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Business Info</TabsTrigger>
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
            <CardHeader className="border-b border-[var(--border)] pb-4">
              <CardTitle className="text-xl">WhatsApp Business API Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/> Phone Number ID</label>
                  <Input placeholder="e.g. 101234567890123" className="bg-[var(--accent)]/50 font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground"/> WABA ID</label>
                  <Input placeholder="e.g. 104567890123456" className="bg-[var(--accent)]/50 font-mono text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><Key className="w-4 h-4 text-muted-foreground"/> Access Token</label>
                <Input type="password" placeholder="EAAB..." className="bg-[var(--accent)]/50 font-mono text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input placeholder="Business Name on WhatsApp" className="bg-[var(--accent)]/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input placeholder="e.g. Retail, Technology" className="bg-[var(--accent)]/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea placeholder="Brief description of your business" className="bg-[var(--accent)]/50" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email (Optional)</label>
                  <Input placeholder="Enter business email" className="bg-[var(--accent)]/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address (Optional)</label>
                  <Input placeholder="Enter business address" className="bg-[var(--accent)]/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website 1 (Optional)</label>
                  <Input placeholder="https://www.example.com" className="bg-[var(--accent)]/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website 2 (Optional)</label>
                  <Input placeholder="https://www.example.com" className="bg-[var(--accent)]/50" />
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6 space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Social Accounts</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Connect your Facebook Page or Instagram account to enable features like click-to-WhatsApp ads, unified inbox, and the ability to sync your profile info.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2"><Facebook className="w-4 h-4 text-blue-500" /> Connect Facebook</Button>
                  <Button variant="outline" className="gap-2"><Instagram className="w-4 h-4 text-pink-500" /> Connect Instagram</Button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" /> Save WhatsApp Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
