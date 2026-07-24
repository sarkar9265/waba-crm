"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Switch } from "@algo-matrix/ui";
import { Loader2, ShieldCheck, Laptop } from "lucide-react";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword("");
      setNewPassword("");
    }, 1000);
  };

  const handleLogoutAll = () => {
    // Simulate logging out all other sessions
    alert("Logged out of all other sessions.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleUpdatePassword}>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none text-[var(--foreground)]">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none text-[var(--foreground)]">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !currentPassword || !newPassword}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Authenticator App</p>
              <p className="text-sm text-[var(--muted-foreground)]">Use an app like Google Authenticator to generate verification codes.</p>
            </div>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active sessions across devices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
            <div className="flex items-center space-x-4">
              <Laptop className="h-6 w-6 text-[var(--muted-foreground)]" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Mac OS • Chrome</p>
                <p className="text-xs text-[var(--muted-foreground)]">New York, USA • Active now</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">Current</span>
          </div>
          <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
            <div className="flex items-center space-x-4">
              <Laptop className="h-6 w-6 text-[var(--muted-foreground)]" />
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Windows 11 • Edge</p>
                <p className="text-xs text-[var(--muted-foreground)]">London, UK • Last active 2 hours ago</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">Revoke</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleLogoutAll}>Log out of all other devices</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
