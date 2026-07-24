"use client";

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from "@algo-matrix/ui";
import { Plus, Megaphone, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns] = useState([
    {
      id: "camp_1",
      name: "Black Friday Sale 2024",
      status: "Completed",
      audience: "All Customers",
      sent: 12500,
      delivered: 12480,
      read: 9850,
      date: "Nov 24, 2024",
    },
    {
      id: "camp_2",
      name: "Cart Abandonment Reminder",
      status: "Active",
      audience: "Abandoned Carts (Automated)",
      sent: 450,
      delivered: 445,
      read: 320,
      date: "Ongoing",
    },
    {
      id: "camp_3",
      name: "Summer Collection Launch",
      status: "Draft",
      audience: "VIP Customers",
      sent: 0,
      delivered: 0,
      read: 0,
      date: "Pending",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns & Broadcasts</h1>
          <p className="text-[var(--muted-foreground)]">Reach your audience at scale with WhatsApp Message Templates.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Messages Available</p>
                <div className="text-2xl font-bold mt-1">250,000</div>
              </div>
              <div className="h-10 w-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Avg. Delivery Rate</p>
                <div className="text-2xl font-bold mt-1 text-emerald-500">99.8%</div>
              </div>
              <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Template Warnings</p>
                <div className="text-2xl font-bold mt-1">0</div>
              </div>
              <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--muted-foreground)] uppercase bg-[var(--accent)]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Audience</th>
                <th className="px-6 py-4 font-medium text-right">Sent</th>
                <th className="px-6 py-4 font-medium text-right">Read</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="bg-[var(--card)] hover:bg-[var(--accent)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--foreground)]">{camp.name}</div>
                    <div className="text-[var(--muted-foreground)] text-xs mt-0.5">{camp.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={camp.status === "Completed" ? "default" : camp.status === "Active" ? "outline" : "secondary"}
                      className={
                        camp.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" :
                        camp.status === "Active" ? "border-[var(--primary)] text-[var(--primary)]" : ""
                      }
                    >
                      {camp.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{camp.audience}</td>
                  <td className="px-6 py-4 text-right font-medium">{camp.sent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {camp.sent > 0 ? (
                      <div className="flex items-center justify-end gap-2">
                        <span>{camp.read.toLocaleString()}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          ({Math.round((camp.read / camp.sent) * 100)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {camp.status === "Draft" ? (
                      <Button variant="ghost" size="sm" className="text-[var(--primary)]">
                        <PlayCircle className="mr-2 h-4 w-4" /> Launch
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">View Report</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
