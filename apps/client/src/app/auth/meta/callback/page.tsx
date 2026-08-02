"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing WhatsApp connection...");
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (processed) return;
      
      const code = searchParams.get("code");
      const setupToken = searchParams.get("setup_token");
      
      if (!code) {
        toast.error("Invalid callback from Meta. Missing code.");
        router.push("/settings/whatsapp");
        return;
      }

      setProcessed(true);

      try {
        setStatus("Connecting your WhatsApp account...");
        // Send the code to the backend
        await api.post("/webhook/whatsapp/oauth", { 
          code,
          setupToken,
          type: 'code',
        });
        
        toast.success("WhatsApp account successfully connected!");
        router.push("/settings/whatsapp");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to connect account.");
        router.push("/settings/whatsapp");
      }
    };

    handleCallback();
  }, [searchParams, router, processed]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)] mb-4" />
      <h2 className="text-xl font-semibold">{status}</h2>
      <p className="text-[var(--muted-foreground)] mt-2">Please wait while we set up your account...</p>
    </div>
  );
}

export default function MetaCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)] mb-4" />
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
