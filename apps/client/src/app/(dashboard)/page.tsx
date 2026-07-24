"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@algo-matrix/ui";
import { MessageSquare, Users, Zap, ArrowRight, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const chartData = [
    { name: 'Mon', messages: 400, inbound: 240, outbound: 160 },
    { name: 'Tue', messages: 300, inbound: 139, outbound: 161 },
    { name: 'Wed', messages: 200, inbound: 98, outbound: 102 },
    { name: 'Thu', messages: 278, inbound: 150, outbound: 128 },
    { name: 'Fri', messages: 189, inbound: 80, outbound: 109 },
    { name: 'Sat', messages: 239, inbound: 110, outbound: 129 },
    { name: 'Sun', messages: 349, inbound: 180, outbound: 169 },
  ];

  const metrics = [
    { title: "Active Conversations", value: "142", icon: MessageSquare, trend: "+12%" },
    { title: "Total Contacts", value: "8,234", icon: Users, trend: "+4%" },
    { title: "Automated Replies", value: "1,492", icon: Zap, trend: "+23%" },
    { title: "AI Chatbot Sessions", value: "483", icon: Bot, trend: "+18%" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
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
          : metrics.map((metric) => (
              <motion.div key={metric.title} variants={item}>
                <Card className="hover:border-[var(--primary)]/50 transition-colors overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-[var(--primary)]" />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-[var(--primary)] font-medium flex items-center mt-1">
                      {metric.trend} from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border)]">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center">
                    <span className="text-[var(--primary)] font-semibold text-sm">+{i}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none">Customer {i}</p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate mt-1">
                      Hi, I wanted to ask about the pricing for...
                    </p>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">10m ago</div>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 px-0 flex items-center gap-2">
              View all messages <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--border)] p-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)]" />
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">Summer Promo Broadcast</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                    Sending
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">Target: 5,000 contacts</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span className="font-medium text-[var(--primary)]">65%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--secondary)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-[var(--primary)]" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Create Campaign</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages by Day</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Types (Outbound vs Inbound)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="inbound" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outbound" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
