"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button, Badge, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Textarea } from "@algo-matrix/ui";
import { Phone, Mail, MapPin, Building, Clock, Tag, X, User, Flag, Archive, Star, Plus } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { format } from "date-fns";

export function ContactContext({ activeId, onClose }: { activeId: string | null, onClose: () => void }) {
  const { conversations, updateConversation, users, fetchUsers } = useChatStore();
  const conversation = conversations.find(c => c.id === activeId);
  const [newLabel, setNewLabel] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (conversation) {
      setNotes(conversation.internalNotes || "");
    }
  }, [conversation?.internalNotes, activeId]);

  if (!activeId || !conversation) return null;

  const contact = conversation.contact;
  
  const handleStatusChange = (status: string) => {
    updateConversation(activeId, { status });
  };

  const handlePriorityChange = (priority: string) => {
    updateConversation(activeId, { priority });
  };
  
  const handleAssigneeChange = (assignedToId: string) => {
    updateConversation(activeId, { assignedToId: assignedToId === "unassigned" ? null : assignedToId });
  };

  const toggleArchive = () => {
    updateConversation(activeId, { isArchived: !conversation.isArchived });
  };
  
  const toggleStar = () => {
    updateConversation(activeId, { isStarred: !conversation.isStarred });
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    const currentLabels = conversation.labels || [];
    if (!currentLabels.includes(newLabel.trim())) {
      updateConversation(activeId, { labels: [...currentLabels, newLabel.trim()] });
    }
    setNewLabel("");
  };

  const handleRemoveLabel = (label: string) => {
    const currentLabels = conversation.labels || [];
    updateConversation(activeId, { labels: currentLabels.filter(l => l !== label) });
  };

  const handleSaveNotes = () => {
    updateConversation(activeId, { internalNotes: notes });
    setIsEditingNotes(false);
  };

  return (
    <div className="flex flex-col h-full border-l border-[var(--border)] bg-[var(--background)] w-full">
      {/* Header */}
      <div className="h-16 border-b border-[var(--border)] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden shrink-0">
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-[var(--foreground)]">Details</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleStar}
            className={conversation.isStarred ? "text-yellow-500" : "text-[var(--muted-foreground)]"}
          >
            <Star className="h-5 w-5" fill={conversation.isStarred ? "currentColor" : "none"} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleArchive}
            className={conversation.isArchived ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}
          >
            <Archive className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={contact?.avatarUrl || ""} />
              <AvatarFallback className="text-3xl bg-[var(--primary)] text-white">
                {(contact?.name || contact?.phone || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-[var(--foreground)]">{contact?.name || 'Unknown'}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{contact?.phone}</p>
          </div>

          <div className="space-y-6">
            
            {/* Conversation Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Manage</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={conversation.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={conversation.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-2">
                <Select value={conversation.assignedToId || "unassigned"} onValueChange={handleAssigneeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users?.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">About</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[var(--muted-foreground)] mt-0.5" />
                  <span className="text-sm">Created {format(new Date(conversation.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center justify-between">
                Labels
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {conversation.labels?.map((label: string, i: number) => (
                  <Badge key={i} variant="secondary" className="font-normal flex gap-1 items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 pr-1.5">
                    <Tag className="h-3 w-3" /> {label}
                    <button onClick={() => handleRemoveLabel(label)} className="ml-1 hover:text-blue-800 dark:hover:text-blue-200">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!conversation.labels || conversation.labels.length === 0) && (
                  <span className="text-sm text-[var(--muted-foreground)]">No labels added</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add label..." 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="secondary" onClick={handleAddLabel} className="h-8 px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Internal Notes
                </h4>
                {!isEditingNotes && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)} className="h-6 px-2 text-xs">
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this contact..."
                    className="min-h-[100px] text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setNotes(conversation.internalNotes || ""); setIsEditingNotes(false); }}>Cancel</Button>
                    <Button variant="default" size="sm" onClick={handleSaveNotes}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--muted)]/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                  {conversation.internalNotes || <span className="text-[var(--muted-foreground)] italic">No internal notes.</span>}
                </div>
              )}
            </div>
            
            {contact?.customFields && Object.keys(contact.customFields).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
                  Custom Fields
                </h4>
                <div className="bg-[var(--muted)]/50 rounded-lg p-3 space-y-2">
                  {Object.entries(contact.customFields).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">{key}</span>
                      <span className="font-medium">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

