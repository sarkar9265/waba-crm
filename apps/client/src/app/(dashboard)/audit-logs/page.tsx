"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@algo-matrix/ui";
import { api } from "@/lib/api";

interface AuditLog {
  id: string;
  action: string;
  entityId: string | null;
  entityType: string | null;
  details: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You do not have permission to view audit logs.");
      } else {
        setError("Failed to fetch audit logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("REMOVED") || action.includes("DELETED") || action.includes("FAILED")) return "destructive";
    if (action.includes("INVITED") || action.includes("CREATED") || action.includes("SUCCESS")) return "default";
    return "secondary";
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--destructive)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Audit Logs</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Track and monitor security events and system changes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Ledger</CardTitle>
          <CardDescription>A chronological record of actions performed in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[var(--border)] overflow-hidden">
            <Table>
              <TableHeader className="bg-[var(--accent)]">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Loading logs...</TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-[var(--muted-foreground)]">No audit logs found.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.user.name || "Unknown"}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{log.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>{log.action.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.entityType ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.entityType}</span>
                            <span className="text-xs text-[var(--muted-foreground)] font-mono">{log.entityId}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs overflow-hidden text-xs text-[var(--muted-foreground)] truncate">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
