"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from "@algo-matrix/ui";
import { Save, UploadCloud, Building2, Globe } from "lucide-react";
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Get presigned URL from our NestJS backend
      const { data: response } = await api.post('/storage/presigned-url', {
        fileName: file.name,
        mimeType: file.type,
      });

      const { url, key } = response.data || response;

      // 2. Upload file directly to S3/Cloudflare R2
      const axios = (await import('axios')).default;
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Save the new avatar URL
      const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';
      const publicUrl = storageBaseUrl ? `${storageBaseUrl}/${key}` : key;
      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully!');
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload avatar. Please check your storage configuration.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your business profile and branding.</p>
      </div>

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
    </div>
  );
}
