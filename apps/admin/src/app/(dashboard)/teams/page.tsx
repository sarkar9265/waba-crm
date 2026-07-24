"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Network, Plus } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Teams & Departments</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage organizational structures.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Team
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Network className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">No teams configured yet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
