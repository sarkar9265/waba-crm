"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Download, BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Reports & Analytics</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Detailed insights into your messaging performance.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {["Total Messages", "Delivery Rate", "Read Rate", "Response Rate"].map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric}</CardTitle>
              <BarChart2 className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(Math.random() * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-20 mb-4" />
          <p className="text-[var(--muted-foreground)]">Advanced charts will be implemented in Phase 16</p>
        </div>
      </Card>
    </div>
  );
}
