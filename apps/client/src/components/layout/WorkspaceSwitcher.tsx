"use client";

import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Avatar, AvatarFallback, AvatarImage, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@algo-matrix/ui";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  plan: string;
};

const initialWorkspaces: Workspace[] = [
  { id: "1", name: "Algo Matrix", plan: "Enterprise" },
];

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: newWorkspaceName,
      plan: "Free",
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace);
    setIsDialogOpen(false);
    setNewWorkspaceName("");
  };

  return (
    <>
      <div className="mb-6 relative z-[100]">
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
          <DropdownMenuContent align="start" className="w-[240px] z-[100]">
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
            <DropdownMenuItem 
              className="gap-2 p-2 cursor-pointer text-[var(--muted-foreground)]"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-sm">Create Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Workspace Name
              </label>
              <Input
                id="name"
                placeholder="e.g. My Awesome Business"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newWorkspaceName.trim()}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
