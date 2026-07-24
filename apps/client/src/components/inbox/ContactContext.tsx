"use client";

import { Avatar, AvatarFallback, AvatarImage, Button, Badge, ScrollArea } from "@algo-matrix/ui";
import { Phone, Mail, MapPin, Building, Clock, Tag, X } from "lucide-react";

export function ContactContext({ activeId, onClose }: { activeId: string | null, onClose: () => void }) {
  if (!activeId) return null;

  return (
    <div className="flex flex-col h-full border-l border-[var(--border)] bg-[var(--background)] w-full">
      {/* Header */}
      <div className="h-16 border-b border-[var(--border)] px-4 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden shrink-0">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-[var(--foreground)]">Contact Details</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="text-3xl bg-[var(--primary)] text-white">JD</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-[var(--foreground)]">John Doe</h3>
            <p className="text-sm text-[var(--muted-foreground)]">+1 (555) 123-4567</p>
            
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="rounded-full w-24">Edit</Button>
              <Button size="sm" className="rounded-full w-24 bg-green-500 hover:bg-green-600 text-white">Call</Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">About</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5" />
                  <span className="text-sm">john.doe@example.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5" />
                  <span className="text-sm">Acme Corp</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5" />
                  <span className="text-sm">New York, USA</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5" />
                  <span className="text-sm">10:42 AM (Local time)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center justify-between">
                Tags
                <Button variant="ghost" size="sm" className="h-6 text-[var(--primary)] p-0 hover:bg-transparent">Add</Button>
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-normal flex gap-1 items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20">
                  <Tag className="h-3 w-3" /> Enterprise
                </Badge>
                <Badge variant="secondary" className="font-normal flex gap-1 items-center bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
                  <Tag className="h-3 w-3" /> Lead
                </Badge>
                <Badge variant="secondary" className="font-normal flex gap-1 items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                  <Tag className="h-3 w-3" /> Urgent
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center justify-between">
                Custom Attributes
                <Button variant="ghost" size="sm" className="h-6 text-[var(--primary)] p-0 hover:bg-transparent">Edit</Button>
              </h4>
              <div className="bg-[var(--muted)]/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Account ID</span>
                  <span className="font-medium">AC-9921</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Source</span>
                  <span className="font-medium">Website Form</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">LTV</span>
                  <span className="font-medium">$12,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
