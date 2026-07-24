"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, CreditCard, Settings, Activity, MessageSquare, Contact, Megaphone, FileText, Network, Bell, Bot, Workflow } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Global Contacts", href: "/contacts", icon: Contact },
    { name: "Observer Inbox", href: "/inbox", icon: MessageSquare },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Teams", href: "/teams", icon: Network },
    { name: "Users", href: "/users", icon: Users },
    { name: "Analytics", href: "/analytics", icon: Activity },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "AI Config", href: "/ai", icon: Bot },
    { name: "Automations", href: "/automation", icon: Workflow },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Audit Logs", href: "/audit-logs", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-[var(--border)] bg-[var(--background)] h-full flex flex-col relative z-10">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <div className="font-bold text-xl tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <span className="text-white text-lg leading-none">A</span>
          </div>
          Algo Admin
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-nav"
                    className="absolute inset-0 bg-[var(--primary)]/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
