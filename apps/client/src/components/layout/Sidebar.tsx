"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@algo-matrix/ui";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  FileText, 
  Megaphone,
  Bot,
  Workflow,
  Settings,
  BarChart,
  CreditCard,
  ClipboardList,
  ImageIcon,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Shared Inbox", href: "/inbox", icon: MessageSquare },
  { name: "Campaigns & Broadcasts", href: "/campaigns", icon: Megaphone },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Media Manager", href: "/media", icon: ImageIcon },
  { name: "AI Chatbot", href: "/ai-chatbot", icon: Bot },
  { name: "Automation", href: "/automation", icon: Workflow },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Billing & Plans", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Team & Roles", href: "/team", icon: Users },
  { name: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
  { name: "Webhooks", href: "/webhooks", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-[var(--card)] px-4 py-6 shadow-sm">
      <WorkspaceSwitcher />

      <nav className="flex-1 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 rounded-lg bg-[var(--primary)]/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "text-[var(--primary)]" 
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 px-2 shrink-0">
        <div className="rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 p-4 border border-[var(--primary)]/20">
          <p className="text-xs font-semibold text-[var(--foreground)]">Trial Active</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">14 days remaining</p>
          <Link href="/billing" className="block mt-3 w-full text-center text-xs font-medium text-white bg-[var(--primary)] rounded-md py-1.5 hover:opacity-90 transition-opacity">
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}
