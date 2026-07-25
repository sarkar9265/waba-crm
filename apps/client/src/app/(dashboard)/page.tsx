"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@algo-matrix/ui";
import { MessageSquare, Users, Megaphone, ArrowRight, Activity, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";

export default function DashboardHome() {
  const { metrics, charts, campaigns, agents, loading, fetchDashboardData } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const summaryCards = metrics ? [
    { title: "Messages Today", value: metrics.messagesToday, icon: MessageSquare, trend: "Daily metric" },
    { title: "Active Conversations", value: metrics.activeConversations, icon: Activity, trend: "Currently open" },
    { title: "Total Contacts", value: metrics.totalContacts, icon: Users, trend: "In database" },
    { title: "Active Campaigns", value: metrics.activeCampaigns, icon: Megaphone, trend: "Running or paused" },
    { title: "Closed Conversations", value: metrics.closedConversations, icon: MessageSquare, trend: "Total resolved" },
    { title: "Pending Conversations", value: metrics.pendingConversations, icon: Activity, trend: "Awaiting reply" },
    { title: "New Contacts", value: metrics.newContacts, icon: Users, trend: "Added today" },
    { title: "Revenue", value: `₹${metrics.revenue.toLocaleString()}`, icon: Trophy, trend: "Total collected" },
    { title: "Active Agents", value: metrics.activeAgents, icon: Users, trend: "Currently active" },
    { title: "Campaign Sent", value: metrics.campaignPerformance.sent, icon: Megaphone, trend: "All campaigns" },
  ] : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Welcome back!</h1>
        <p className="text-[var(--muted-foreground)] mt-1">Here is a quick overview of your WhatsApp Business.</p>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {loading || !metrics
          ? Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : summaryCards.map((card) => (
              <motion.div key={card.title} variants={item}>
                <Card className="hover:border-[var(--primary)]/50 transition-colors overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <card.icon className="h-4 w-4 text-[var(--primary)]" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                    <p className="text-xs text-[var(--muted-foreground)] font-medium flex items-center mt-1">
                      {card.trend}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Agent Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : agents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
                No agent data available.
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--accent)]/30 border border-[var(--border)]">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      #{i + 1}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold leading-none">{agent.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {agent.solved} conversations solved
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">{agent.csat}%</div>
                      <div className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">CSAT</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-auto pt-4">
              <Button variant="link" className="px-0 flex items-center gap-2">
                View all agents <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-center text-[var(--muted-foreground)]">
                <Megaphone className="h-8 w-8 mb-2 opacity-50" />
                <p>No active campaigns.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map(c => {
                  const target = Array.isArray(c.audience?.tags) ? c.audience.tags.join(', ') : 'All Contacts';
                  const total = c.sent + c.failed;
                  const progress = total > 0 ? (c.sent / total) * 100 : 0;
                  
                  return (
                    <div key={c.id} className="rounded-lg border border-[var(--border)] p-4 relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
                      <div className={`absolute top-0 left-0 w-1 h-full ${c.status === 'RUNNING' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm truncate pr-2">{c.name}</h4>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${c.status === 'RUNNING' ? 'text-blue-600 bg-blue-100' : 'text-amber-600 bg-amber-100'}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">Target: {target}</p>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Sent: {c.sent} / Failed: {c.failed}</span>
                          <span className="font-medium text-[var(--primary)]">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-[var(--primary)]" 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/campaigns/create" passHref>
              <Button variant="outline" className="w-full mt-4">Create Campaign</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages by Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center pl-8">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area type="monotone" dataKey="messages" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Types (Inbound vs Outbound)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center pl-8">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="inbound" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Inbound" />
                    <Bar dataKey="outbound" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Outbound" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery, Read & Reply Rates (%)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center pl-8">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="deliveryRate" stroke="var(--primary)" strokeWidth={2} name="Delivery Rate" />
                    <Line type="monotone" dataKey="readRate" stroke="#10b981" strokeWidth={2} name="Read Rate" />
                    <Line type="monotone" dataKey="replyRate" stroke="#f59e0b" strokeWidth={2} name="Reply Rate" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Response Time & Campaign ROI</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center pl-8">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#ef4444" strokeWidth={2} name="Response Time (mins)" />
                    <Line yAxisId="right" type="monotone" dataKey="campaignRoi" stroke="#8b5cf6" strokeWidth={2} name="Campaign ROI (%)" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
