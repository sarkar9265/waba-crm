"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { BarChart2, Download } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">System Analytics</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Platform-wide metrics and usage statistics.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <BarChart2 className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Analytics module will be implemented in Phase 16</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
