"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, Button, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from "@algo-matrix/ui";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface WhatsAppProfile {
  about?: string;
  address?: string;
  description?: string;
  email?: string;
  websites?: string[];
  vertical?: string;
}

const VERTICALS = [
  "OTHER", "AUTO", "BEAUTY", "APPAREL", "EDU", "ENTERTAIN", "EVENT_PLAN", "FINANCE", "GROCERY", "GOVT", "HOTEL", "HEALTH", "NONPROFIT", "PROF_SERVICES", "RETAIL", "TRAVEL", "RESTAURANT"
];

export default function WhatsAppProfilePage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<WhatsAppProfile>({});

  useEffect(() => {
    fetchProfile();
  }, [accountId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/webhook/whatsapp/accounts/${accountId}/profile`);
      setProfile(res.data || {});
    } catch (error) {
      toast.error("Failed to fetch WhatsApp profile");
      router.push("/settings/whatsapp");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/webhook/whatsapp/accounts/${accountId}/profile`, profile);
      toast.success("WhatsApp profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update WhatsApp profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof WhatsAppProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/settings/whatsapp">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">WhatsApp Profile Settings</h1>
          <p className="text-[var(--muted-foreground)]">Manage your business profile details displayed on WhatsApp.</p>
        </div>
      </div>

      <Card className="border-[var(--border)]">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="about">About (Status)</Label>
              <Input
                id="about"
                value={profile.about || ""}
                onChange={(e) => handleChange("about", e.target.value)}
                placeholder="Hey there! I am using WhatsApp."
                maxLength={139}
              />
              <p className="text-xs text-[var(--muted-foreground)]">Max 139 characters.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={profile.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your business..."
                rows={4}
                maxLength={256}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Business St, City, Country"
                maxLength={256}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@yourbusiness.com"
                maxLength={128}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websites">Website</Label>
              <Input
                id="websites"
                type="url"
                value={profile.websites?.[0] || ""}
                onChange={(e) => handleChange("websites", e.target.value ? [e.target.value] : [])}
                placeholder="https://yourbusiness.com"
                maxLength={256}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vertical">Vertical / Category</Label>
              <Select
                value={profile.vertical || "OTHER"}
                onValueChange={(val) => handleChange("vertical", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a business category" />
                </SelectTrigger>
                <SelectContent>
                  {VERTICALS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
