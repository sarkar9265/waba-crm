"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@algo-matrix/ui";
import { Users, Plus, Shield } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">User Management</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Manage global users, roles, and permissions.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center">
                  SA
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">Super Admin</p>
                  <p className="text-sm text-[var(--muted-foreground)]">admin@algomatrix.com</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-medium">Owner</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
