"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@algo-matrix/ui";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`https://api.algomatrixai.com/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to verify email. The link might be expired.");
        }

        setStatus("success");
        setMessage("Your email has been successfully verified!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Verifying Email</h2>
        </>
      )}
      
      {status === "success" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Email Verified</h2>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Verification Failed</h2>
        </>
      )}

      <p className="text-sm text-[var(--muted-foreground)] mt-2">{message}</p>
      
      <div className="mt-8">
        <Link href="/login">
          <Button className="w-full">
            {status === "success" ? "Continue to login" : "Return to login"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
