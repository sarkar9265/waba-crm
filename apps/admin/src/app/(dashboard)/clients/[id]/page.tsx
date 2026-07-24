"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge 
} from "@algo-matrix/ui";
import { ArrowLeft, CheckCircle2, MessageSquare, Users, Database, Clock, Activity, Settings } from "lucide-react";

export default function ClientDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock data for the specific client
  const client = {
    id,
    name: id === "ten_1" ? "Acme Corp" : "Global Tech",
    email: "admin@acme.com",
    plan: "Pro",
    status: "Active",
    wabaConnected: true,
    joinedAt: "2024-03-15",
    limits: {
      messagesSent: 45200,
      messagesLimit: 100000,
      agentsActive: 5,
      agentsLimit: 10,
      storageUsed: 2.4, // GB
      storageLimit: 10 // GB
    },
    activities: [
      { id: 1, action: "Logged in", date: "2 mins ago", user: "Admin" },
      { id: 2, action: "Sent bulk campaign 'Summer Promo'", date: "2 hours ago", user: "System" },
      { id: 3, action: "Added new agent 'Sarah Jenkins'", date: "1 day ago", user: "Admin" },
      { id: 4, action: "Upgraded to Pro Plan", date: "1 week ago", user: "Billing" },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              <Badge variant={client.status === "Active" ? "default" : "destructive"} className={client.status === "Active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" : ""}>
                {client.status}
              </Badge>
            </div>
            <p className="text-[var(--muted-foreground)] mt-1">{client.email} • Joined {client.joinedAt}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Settings className="mr-2 h-4 w-4" />
            Manage Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Usage Metrics */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits & Quotas</CardTitle>
              <CardDescription>Monitor how this client is consuming their {client.plan} plan resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Messages Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Messages Sent
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {client.limits.messagesSent.toLocaleString()} / {client.limits.messagesLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all" 
                    style={{ width: `${(client.limits.messagesSent / client.limits.messagesLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Agents Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4 text-purple-500" />
                    Active Agents
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {client.limits.agentsActive} / {client.limits.agentsLimit}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all" 
                    style={{ width: `${(client.limits.agentsActive / client.limits.agentsLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Storage Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Database className="h-4 w-4 text-emerald-500" />
                    Media Storage
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {client.limits.storageUsed} GB / {client.limits.storageLimit} GB
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all" 
                    style={{ width: `${(client.limits.storageUsed / client.limits.storageLimit) * 100}%` }}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Info & Activity Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              {client.wabaConnected ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">WhatsApp Cloud API</p>
                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Connected successfully</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                  <Activity className="h-6 w-6 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">WhatsApp Cloud API</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Pending setup</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {client.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5 relative">
                      <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                      {activity.id !== client.activities.length && (
                        <div className="absolute top-3 bottom-[-24px] left-1 w-px bg-[var(--border)] -translate-x-1/2" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {activity.date}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">• by {activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
