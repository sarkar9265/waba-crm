"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@algo-matrix/ui";
import { Key, Copy, Check, RefreshCw } from "lucide-react";

export function ApiKeysSettings() {
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("sk_test_51Nx...v8Qp");
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    // Simulate API call to generate new key
    setTimeout(() => {
      setApiKey(`sk_live_${Math.random().toString(36).substring(2, 15)}`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Developer API Keys</CardTitle>
          <CardDescription>Use these keys to authenticate API requests from your own backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 p-4 rounded-lg flex items-start space-x-4">
            <Key className="h-5 w-5 text-[var(--primary)] mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-[var(--foreground)]">Secret Key</h4>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">Keep this key secret. Do not share it in client-side code.</p>
              <div className="flex items-center space-x-2">
                <code className="bg-[var(--muted)] px-3 py-1.5 rounded text-sm font-mono flex-1 border border-[var(--border)] overflow-hidden text-ellipsis">
                  {apiKey}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-[var(--border)] pt-6">
          <p className="text-xs text-[var(--muted-foreground)]">Regenerating this key will immediately invalidate the old one.</p>
          <Button variant="destructive" onClick={handleRegenerate} disabled={loading}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Regenerate Key
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
