"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@algo-matrix/ui";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Notifications Center</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage global alerts and system notifications.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Bell className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Notifications will be fully implemented in Phase 17</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
