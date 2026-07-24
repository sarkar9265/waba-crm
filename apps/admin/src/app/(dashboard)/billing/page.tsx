"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { CreditCard, Download } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Billing & Subscriptions</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage tenant plans, usage, and invoices.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <CreditCard className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Billing module will be fully implemented in Phase 13</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
