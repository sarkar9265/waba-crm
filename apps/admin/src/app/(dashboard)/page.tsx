"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@algo-matrix/ui";
import { Users, MessageSquare, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminDashboard() {
  const metrics = [
    {
      title: "Total Clients",
      value: "128",
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Messages Sent (MTD)",
      value: "1.2M",
      change: "+24%",
      trend: "up",
      icon: MessageSquare,
    },
    {
      title: "Monthly Recurring Revenue",
      value: "$14,500",
      change: "+8%",
      trend: "up",
      icon: CreditCard,
    },
    {
      title: "Failed Webhooks",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-[var(--muted-foreground)]">Monitor your SaaS platform's health and metrics.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-[var(--primary)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs flex items-center mt-1">
                {metric.trend === "up" ? (
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {metric.change}
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {metric.change}
                  </span>
                )}
                <span className="text-[var(--muted-foreground)] ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Acme Corp", email: "contact@acme.com", plan: "Pro", date: "2 hours ago" },
                { name: "Global Tech", email: "hello@global.tech", plan: "Enterprise", date: "5 hours ago" },
                { name: "Stark Industries", email: "info@stark.com", plan: "Basic", date: "1 day ago" },
              ].map((client) => (
                <div key={client.email} className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">
                      {client.plan}
                    </span>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{client.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Meta API Rate Limit Warning", time: "10 mins ago", type: "warning" },
                { title: "Database CPU Spike", time: "2 hours ago", type: "critical" },
                { title: "Stripe Webhook Delayed", time: "5 hours ago", type: "warning" },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-4 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${alert.type === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
