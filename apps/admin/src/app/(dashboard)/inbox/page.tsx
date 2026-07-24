"use client";

import { Card, CardContent } from "@algo-matrix/ui";
import { MessageSquare } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Global Inbox Observer</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Supervise conversations across tenants.</p>
      </div>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full flex">
          <div className="w-80 border-r border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center">
             <MessageSquare className="h-8 w-8 text-[var(--muted-foreground)] opacity-50 mb-2" />
             <p className="text-sm text-[var(--muted-foreground)] text-center px-4">Select a workspace to view inbox</p>
          </div>
          <div className="flex-1 bg-[var(--background)] flex items-center justify-center">
             <p className="text-[var(--muted-foreground)]">No conversation selected</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
