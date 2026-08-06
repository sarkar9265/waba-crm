"use client";

import { useState } from "react";
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
  Input,
  Label
} from "@algo-matrix/ui";
import { Webhook, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface WebhookEndpoint {
  id: string;
  url: string;
  status: "active" | "inactive";
  events: string[];
  createdAt: string;
}

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_12345",
    url: "https://your-system.com/api/webhook",
    status: "active",
    events: ["message.received", "message.sent"],
    createdAt: new Date().toISOString(),
  }
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newWebhook: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url: newUrl,
      status: "active",
      events: ["all_events"],
      createdAt: new Date().toISOString(),
    };

    setWebhooks([...webhooks, newWebhook]);
    setIsDialogOpen(false);
    setNewUrl("");
    toast.success("Webhook endpoint created successfully");
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook endpoint deleted");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Webhook className="h-8 w-8 text-[var(--primary)]" />
            Webhooks
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Connect your own systems to receive real-time updates when events happen.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Webhook
        </Button>
      </div>

      <Card className="bg-[var(--card)] border-[var(--border)] shadow-sm">
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>Manage where we send your event payloads.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[var(--border)] overflow-hidden">
            <Table>
              <TableHeader className="bg-[var(--background)]">
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead>Endpoint URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[var(--muted-foreground)]">
                      No webhook endpoints configured. Click 'Create Webhook' to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.id} className="border-[var(--border)]">
                      <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                      <TableCell>
                        {webhook.status === 'active' ? (
                          <Badge variant="default" className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-none">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-none">
                            <XCircle className="w-3 h-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[var(--muted-foreground)]">
                        {new Date(webhook.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(webhook.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWebhook} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="url">Payload URL</Label>
              <Input 
                id="url" 
                type="url"
                required
                placeholder="https://your-domain.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                We will send POST requests to this URL when events occur.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
