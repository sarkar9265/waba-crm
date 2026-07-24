"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Megaphone, Plus } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Campaign Management</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Oversee broadcast campaigns and their delivery status.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Megaphone className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">Campaign builder will be implemented in Phase 7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
