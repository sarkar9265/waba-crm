"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@algo-matrix/ui";
import { Activity, RotateCcw, AlertTriangle, CheckCircle2, Clock, FileJson, AlertCircle, Search, RotateCw } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";

interface WebhookStats {
  pending: number;
  processed: number;
  failed: number;
  total: number;
}

interface WebhookLog {
  id: string;
  payload: any;
  status: "PENDING" | "PROCESSED" | "FAILED";
  attempts: number;
  error: string | null;
  event: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function WebhooksPage() {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get("/webhooks/stats"),
        api.get("/webhooks/logs?limit=50"),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch webhook data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRetry = async (id: string) => {
    setIsRetrying(id);
    try {
      const res = await api.post(`/webhooks/${id}/retry`);
      if (res.data.success) {
        toast.success("Webhook re-queued successfully");
        setLogs(prev => prev.map(log => log.id === id ? res.data.log : log));
        setStats(prev => prev ? { 
          ...prev, 
          failed: prev.failed - 1, 
          pending: prev.pending + 1 
        } : null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to retry webhook");
    } finally {
      setIsRetrying(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSED": return <Badge variant="default" className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Processed</Badge>;
      case "FAILED": return <Badge variant="destructive" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-none"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case "PENDING": return <Badge variant="secondary" className="bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-none"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-[var(--primary)]" />
          Webhook Monitoring
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Monitor incoming Meta webhooks, track processing status, and retry failed events.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <Activity className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.processed || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed (DLQ)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Queue</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Live feed of incoming webhook events from Meta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={parentRef} className="rounded-md border border-[var(--border)] h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[var(--background)] z-10">
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead>Event ID / Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[var(--muted-foreground)]">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[var(--muted-foreground)]">
                      No webhook logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {rowVirtualizer.getVirtualItems().length > 0 && (
                      <TableRow style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
                    )}
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const log = logs[virtualRow.index];
                      return (
                        <TableRow key={log.id} className="border-[var(--border)]" style={{ height: `${virtualRow.size}px` }}>
                          <TableCell>
                            <div className="font-medium text-xs font-mono">{log.id.slice(-8)}</div>
                            <div className="text-sm text-[var(--muted-foreground)] capitalize">
                              {log.event?.replace(/_/g, ' ') || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.attempts}</TableCell>
                          <TableCell className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                            {format(new Date(log.createdAt), "PP HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <FileJson className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {log.status === "FAILED" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                onClick={() => handleRetry(log.id)}
                                disabled={isRetrying === log.id}
                              >
                                <RotateCw className={`h-4 w-4 mr-2 ${isRetrying === log.id ? "animate-spin" : ""}`} />
                                Retry
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {rowVirtualizer.getVirtualItems().length > 0 && (
                      <TableRow style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} />
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Payload Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedLog.status)}
                <span className="text-sm text-[var(--muted-foreground)] font-mono">{selectedLog.id}</span>
                <span className="text-sm text-[var(--muted-foreground)] ml-auto">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              
              {selectedLog.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-mono whitespace-pre-wrap">{selectedLog.error}</div>
                </div>
              )}

              <div className="bg-[var(--accent)] p-4 rounded-md border border-[var(--border)]">
                <pre className="text-xs font-mono overflow-x-auto text-[var(--foreground)]">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
