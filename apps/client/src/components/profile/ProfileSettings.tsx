"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage } from "@algo-matrix/ui";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loader2, Upload } from "lucide-react";

export function ProfileSettings() {
  const { user, token } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    // Existing S3 logic would go here
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      // Simulate API call for S3 upload via backend
      /*
      await fetch("https://api.algomatrixai.com/users/avatar", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      */
      setTimeout(() => setAvatarLoading(false), 1500);
    } catch (error) {
      console.error(error);
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a new avatar to update your profile.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" />
            <AvatarFallback className="text-xl">{name.charAt(0) || email.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarLoading}
              />
              <label htmlFor="avatar-upload">
                <Button variant="outline" className="cursor-pointer" asChild disabled={avatarLoading}>
                  <span>
                    {avatarLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Image
                  </span>
                </Button>
              </label>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <form onSubmit={handleUpdateProfile}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none text-[var(--foreground)]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none text-[var(--foreground)]">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm ring-offset-[var(--background)] cursor-not-allowed opacity-50"
              />
              <p className="text-xs text-[var(--muted-foreground)]">Your email address is managed by your organization.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
