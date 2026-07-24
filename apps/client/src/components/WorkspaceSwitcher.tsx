"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";

export function WorkspaceSwitcher() {
  // Mock data for workspaces
  const workspaces = [
    { id: "1", name: "Algo Matrix" },
    { id: "2", name: "Acme Corp" },
    { id: "3", name: "Stark Industries" }
  ];

  return (
    <div className="flex items-center gap-2 mb-8 group cursor-pointer relative px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm overflow-hidden p-1">
        <Image src="/logo.png" alt="Algo Matrix Logo" width={32} height={32} className="object-contain" />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="text-sm font-semibold tracking-tight text-[var(--foreground)] truncate">
          Algo Matrix
        </span>
        <span className="text-[10px] text-[var(--muted-foreground)] truncate">
          Pro Plan
        </span>
      </div>
      <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
      
      {/* Simple native select layered on top for functionality without complex state */}
      <select 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Switch Workspace"
        defaultValue="1"
      >
        {workspaces.map(ws => (
          <option key={ws.id} value={ws.id}>{ws.name}</option>
        ))}
      </select>
    </div>
  );
}
