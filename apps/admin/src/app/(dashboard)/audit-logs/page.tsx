"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Activity, Download } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Audit Logs</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Track all system activities and changes.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Audit Logs will be implemented in Phase 18</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
