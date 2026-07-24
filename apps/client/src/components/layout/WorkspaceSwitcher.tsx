"use client";

import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Avatar, AvatarFallback, AvatarImage } from "@algo-matrix/ui";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  plan: string;
};

const workspaces: Workspace[] = [
  { id: "1", name: "Algo Matrix", plan: "Enterprise" },
  { id: "2", name: "Acme Corp", plan: "Pro" },
];

export function WorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2 py-1.5 h-12 hover:bg-[var(--accent)] text-left">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 rounded-lg border border-[var(--border)]">
              <AvatarImage src={`https://avatar.vercel.sh/${activeWorkspace.id}.png`} alt={activeWorkspace.name} />
              <AvatarFallback className="rounded-lg">{activeWorkspace.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 max-w-[120px]">
              <span className="text-sm font-semibold truncate leading-none">{activeWorkspace.name}</span>
              <span className="text-xs text-[var(--muted-foreground)] truncate leading-none">{activeWorkspace.plan}</span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-[var(--muted-foreground)]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel className="text-xs text-[var(--muted-foreground)]">Workspaces</DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace)}
            className="flex items-center justify-between gap-2 p-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 rounded-sm border border-[var(--border)]">
                <AvatarFallback className="rounded-sm text-[10px]">{workspace.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{workspace.name}</span>
            </div>
            {activeWorkspace.id === workspace.id && <Check className="h-4 w-4 text-[var(--primary)]" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2 cursor-pointer text-[var(--muted-foreground)]">
          <PlusCircle className="h-4 w-4" />
          <span className="text-sm">Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
