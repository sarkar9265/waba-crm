"use client";

import { Input } from "@algo-matrix/ui";
import { Search, Bell, Shield } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex-1 flex items-center gap-4 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input 
            placeholder="Search clients or subscriptions..." 
            className="pl-9 bg-[var(--accent)] border-transparent w-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[var(--background)]"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-4 border-l border-[var(--border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-[var(--foreground)] leading-none">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
