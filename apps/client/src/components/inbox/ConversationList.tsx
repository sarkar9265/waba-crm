"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, MessageSquare } from "lucide-react";
import { Input, Button, ScrollArea, Avatar, AvatarFallback, AvatarImage, Badge } from "@algo-matrix/ui";

type ConversationListProps = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  const conversations = [
    { id: "c_1", name: "John Doe", phone: "+1 555 123 4567", lastMessage: "Thanks for the update!", timestamp: "10:42 AM", unread: 2 },
    { id: "c_2", name: "Sarah Smith", phone: "+1 555 987 6543", lastMessage: "When will my order arrive?", timestamp: "Yesterday", unread: 0 },
    { id: "c_3", name: "+1 555 444 3333", phone: "+1 555 444 3333", lastMessage: "I need help with my account.", timestamp: "Yesterday", unread: 0 },
    { id: "c_4", name: "Mike Johnson", phone: "+1 555 222 1111", lastMessage: "Sounds good, see you then.", timestamp: "Monday", unread: 0 },
  ];

  const filtered = conversations.filter(c => filter === "All" || (filter === "Unread" && c.unread > 0));

  return (
    <div className="flex flex-col h-full border-r border-[var(--border)] bg-[var(--background)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input placeholder="Search messages..." className="pl-9 bg-[var(--muted)]/50 border-none" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-2 px-4 border-b border-[var(--border)]">
        <Button 
          variant={filter === "All" ? "default" : "ghost"} 
          size="sm" 
          className="rounded-full h-8"
          onClick={() => setFilter("All")}
        >
          All
        </Button>
        <Button 
          variant={filter === "Unread" ? "default" : "ghost"} 
          size="sm" 
          className="rounded-full h-8"
          onClick={() => setFilter("Unread")}
        >
          Unread
        </Button>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 space-y-1">
          {filtered.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={`flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-[var(--accent)] ${activeId === chat.id ? 'bg-[var(--accent)] ring-1 ring-[var(--border)]' : ''}`}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className={activeId === chat.id ? "bg-[var(--primary)] text-white" : ""}>
                  {chat.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate text-[var(--foreground)]">{chat.name}</span>
                  <span className={`text-xs whitespace-nowrap ml-2 ${chat.unread > 0 ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                    {chat.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-10 w-10 text-[var(--muted-foreground)] mb-3 opacity-20" />
              <p className="text-[var(--muted-foreground)] text-sm font-medium">No conversations found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
