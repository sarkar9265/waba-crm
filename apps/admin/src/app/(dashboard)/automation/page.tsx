"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@algo-matrix/ui";
import { Workflow } from "lucide-react";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Automation Workflows</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage and observe global automation triggers and flows.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Workflow className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Workflow Builder will be implemented in Phase 11</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
