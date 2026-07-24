"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Users, Search, Plus } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Contacts Directory</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage global contacts across all workspaces.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 bg-[var(--background)] px-3 py-2 rounded-lg border border-[var(--border)] max-w-sm">
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Search contacts..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="h-[400px] flex items-center justify-center border rounded-lg border-dashed">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
              <p className="text-[var(--muted-foreground)]">No contacts found or sync pending.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
