"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@algo-matrix/ui";
import { Bot } from "lucide-react";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">AI Configuration</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage global AI models and settings.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Global AI Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Bot className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">AI settings will be implemented in Phase 10</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
