"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@algo-matrix/ui";
import { Loader2 } from "lucide-react";

export default function TwoFactorAuthPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  // Assume a temporary token or session ID is stored in auth store before 2FA
  const { user, token, setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.algomatrixai.com/auth/2fa/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Use the partial token issued at login
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        throw new Error("Invalid authentication code");
      }

      const data = await res.json();
      // Update with the final authenticated token
      setUser(data.user, data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Two-Factor Authentication</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      <div className="mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--foreground)]">
              Authentication Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center tracking-[0.5em] font-mono text-lg"
              placeholder="000000"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and Sign In"
            )}
          </Button>
        </form>
      </div>
    </>
  );
}
