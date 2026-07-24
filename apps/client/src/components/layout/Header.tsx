"use client";

import { Bell, LogOut } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsPopover } from "./NotificationsPopover";

export function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-[var(--background)] px-6">
      <div className="flex-1 flex items-center gap-6">
        <BreadcrumbNav />
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <NotificationsPopover />
        <div className="h-8 w-px bg-[var(--border)] mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user?.name || "User"}</span>
            <span className="text-xs text-[var(--muted-foreground)] capitalize">{user?.role ? user.role.toLowerCase() : "Agent"}</span>
          </div>
          <button onClick={logout} className="p-2 rounded-full bg-[var(--accent)] text-[var(--foreground)] hover:bg-red-500 hover:text-white transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
