"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@algo-matrix/ui";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://api.algomatrixai.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Check your email</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-4">
          We have sent a password reset link to <span className="font-medium text-[var(--foreground)]">{email}</span>.
        </p>
        <div className="mt-8">
          <Link href="/login">
            <Button variant="outline" className="w-full">Return to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Reset password</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Enter your email address and we'll send you a link to reset your password.
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
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--background)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="name@example.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
}
