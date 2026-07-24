"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-[var(--background)] px-6">
      <div className="flex-1 flex items-center gap-6">
        <BreadcrumbNav />
        <div className="flex items-center gap-4 bg-[var(--accent)] px-3 py-1.5 rounded-full border border-[var(--border)] max-w-md w-full transition-all focus-within:ring-2 focus-within:ring-[var(--primary)]">
          <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
          <input 
            type="text" 
            placeholder="Search contacts, messages..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[var(--muted-foreground)] text-[var(--foreground)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <button className="relative p-2 rounded-full hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--primary)] border-2 border-[var(--background)]"></span>
        </button>
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
