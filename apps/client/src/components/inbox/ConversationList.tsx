"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MoreVertical, MessageSquare, Loader2 } from "lucide-react";
import { Input, Button, ScrollArea, Avatar, AvatarFallback, AvatarImage, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@algo-matrix/ui";
import { useChatStore, Conversation } from "@/store/useChatStore";
import { format, isToday, isYesterday } from "date-fns";

type ConversationListProps = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const [filter, setFilter] = useState<"All" | "Unread" | "Unassigned" | "Closed">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const observerTarget = useRef(null);

  const {
    conversations,
    loadingConversations,
    hasMoreConversations,
    fetchConversations,
    fetchMoreConversations,
    users,
    fetchUsers,
    bulkUpdateConversations
  } = useChatStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = (userId: string) => {
    if (selectedIds.length > 0) {
      bulkUpdateConversations(selectedIds, { assignedToId: userId === "unassigned" ? null : userId });
      setSelectedIds([]);
      setIsBulkMode(false);
    }
  };

  useEffect(() => {
    fetchConversations({ status: filter === "All" ? undefined : filter });
  }, [filter, fetchConversations]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMoreConversations && !loadingConversations) {
        fetchMoreConversations({ status: filter === "All" ? undefined : filter });
      }
    },
    [hasMoreConversations, loadingConversations, fetchMoreConversations, filter]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => observer.disconnect();
  }, [handleObserver]);

  const filtered = conversations.filter(c => {
    const matchSearch = c.contact?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.contact?.phone?.includes(searchQuery);
    let matchFilter = true;
    if (filter === "Unread") matchFilter = (c.unreadCount || 0) > 0;
    if (filter === "Unassigned") matchFilter = !c.assignedToId;
    if (filter === "Closed") matchFilter = c.status === "CLOSED";
    // If not showing Closed specifically, we should probably hide CLOSED from 'All' or 'Unassigned'?
    // Let's just keep 'All' literally 'All' for now, but usually it hides closed. We will leave it as true.
    return matchSearch && matchFilter;
  });

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MM/dd/yyyy");
  };

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
          <Input 
            placeholder="Search messages..." 
            className="pl-9 bg-[var(--muted)]/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters & Bulk Mode */}
      <div className="flex flex-col gap-2 p-2 px-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
            <Button 
              variant={filter === "Unassigned" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-full h-8"
              onClick={() => setFilter("Unassigned")}
            >
              Unassigned
            </Button>
            <Button 
              variant={filter === "Closed" ? "default" : "ghost"} 
              size="sm" 
              className="rounded-full h-8"
              onClick={() => setFilter("Closed")}
            >
              Closed
            </Button>
          </div>
          <Button 
            variant={isBulkMode ? "secondary" : "ghost"} 
            size="sm" 
            className="rounded-full h-8 text-xs"
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedIds([]);
            }}
          >
            {isBulkMode ? "Cancel Bulk" : "Bulk Select"}
          </Button>
        </div>

        {isBulkMode && (
          <div className="flex items-center gap-2 bg-[var(--accent)] p-2 rounded-md justify-between">
            <span className="text-xs font-medium">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedIds(filtered.map(c => c.id))}>Select All</Button>
              <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleBulkAssign("unassigned")} disabled={selectedIds.length === 0}>Unassign</Button>
              <Select onValueChange={handleBulkAssign} disabled={selectedIds.length === 0}>
                <SelectTrigger className="h-7 text-xs w-[120px]">
                  <SelectValue placeholder="Assign To" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">{u.name || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 space-y-1">
          {filtered.map((chat) => {
            const lastMessage = chat.messages?.[0];
            const lastMessageContent = lastMessage?.type === 'text' ? lastMessage.content : `[${lastMessage?.type || 'Media'}]`;
            
            return (
              <div key={chat.id} className="flex items-center gap-2">
                {isBulkMode && (
                  <div className="pl-2">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(chat.id)}
                      onChange={() => toggleSelection(chat.id)}
                      className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                  </div>
                )}
                <button
                  onClick={() => !isBulkMode && onSelect(chat.id)}
                  className={`flex-1 flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-[var(--accent)] ${activeId === chat.id ? 'bg-[var(--accent)] ring-1 ring-[var(--border)]' : ''}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={chat.contact?.avatarUrl || ""} />
                    <AvatarFallback className={activeId === chat.id ? "bg-[var(--primary)] text-white" : ""}>
                      {(chat.contact?.name || chat.contact?.phone || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate text-[var(--foreground)]">{chat.contact?.name || chat.contact?.phone}</span>
                      <div className="flex items-center gap-2">
                        {chat.priority === "URGENT" && <div className="h-2 w-2 rounded-full bg-red-500" title="Urgent Priority" />}
                        {chat.priority === "HIGH" && <div className="h-2 w-2 rounded-full bg-orange-500" title="High Priority" />}
                        <span className={`text-xs whitespace-nowrap ${(chat.unreadCount || 0) > 0 ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                          {formatTimestamp(chat.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${(chat.unreadCount || 0) > 0 ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                        {lastMessageContent || "No messages yet"}
                      </p>
                      {(chat.unreadCount || 0) > 0 && (
                        <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center shrink-0">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}

          {loadingConversations && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          )}

          <div ref={observerTarget} className="h-4 w-full" />

          {!loadingConversations && filtered.length === 0 && (
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
