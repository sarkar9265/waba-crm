"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button, ScrollArea, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge } from "@algo-matrix/ui";
import { Check, CheckCheck, Paperclip, Send, Smile, Phone, MoreVertical, Search, FileText, Image as ImageIcon, X, Loader2, MessageSquare } from "lucide-react";
import { useChatStore, Message } from "@/store/useChatStore";
import { format, isToday, isYesterday } from "date-fns";
import { api } from "@/lib/api";

export function ChatWindow({ activeId }: { activeId: string | null }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { conversations, messages, loadingMessages, fetchMessages, sendMessage, socket } = useChatStore();
  const conversation = conversations.find(c => c.id === activeId);
  const chatMessages = activeId ? messages[activeId] || [] : [];
  const isLoading = activeId ? loadingMessages[activeId] : false;

  useEffect(() => {
    if (activeId && !messages[activeId] && !loadingMessages[activeId]) {
      fetchMessages(activeId);
    }
  }, [activeId, messages, loadingMessages, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!activeId || (!inputMessage.trim() && !attachment)) return;
    
    let type = 'text';
    if (attachment) {
      if (attachment.type.startsWith('image/')) type = 'image';
      else if (attachment.type.startsWith('video/')) type = 'video';
      else if (attachment.type.startsWith('audio/')) type = 'audio';
      else type = 'document';
    }

    const payload = {
      content: inputMessage.trim(),
      type,
      mediaUrl: attachment?.url || null,
      mediaType: attachment?.type || null
    };

    setInputMessage("");
    setAttachment(null);
    await sendMessage(activeId, payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/storage/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachment({
        url: res.data.data.url,
        type: res.data.data.type,
        name: res.data.data.name
      });
    } catch (error) {
      console.error('Failed to upload file', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  if (!activeId || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[var(--muted)]/20">
        <div className="bg-[var(--background)] p-8 rounded-2xl shadow-sm text-center max-w-sm border border-[var(--border)]">
          <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">WhatsApp Inbox</h3>
          <p className="text-[var(--muted-foreground)] text-sm">Select a conversation from the sidebar to start messaging.</p>
        </div>
      </div>
    );
  }

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'image' && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          <img src={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} alt="attachment" className="rounded-lg max-w-sm max-h-64 object-cover" />
          {msg.content && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    if (msg.type === 'document' && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-black/20 rounded-md">
            <FileText className="h-6 w-6 opacity-70" />
            <a href={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">
              Document Attachment
            </a>
          </div>
          {msg.content && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    return <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a]">
      {/* Chat Header */}
      <div className="h-16 border-b border-[var(--border)] bg-[var(--background)] px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.contact?.avatarUrl || ""} />
            <AvatarFallback className="bg-[var(--primary)] text-white">
              {(conversation.contact?.name || conversation.contact?.phone || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-[var(--foreground)] leading-none mb-1">
              {conversation.contact?.name || conversation.contact?.phone}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {conversation.contact?.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)]">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)]">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Message History */}
      <ScrollArea className="flex-1 p-4">
        {isLoading && chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4 max-w-3xl mx-auto">
            {chatMessages.map((msg, idx) => {
              const isOutbound = msg.direction === 'OUTBOUND';
              const showAvatar = !isOutbound && (idx === chatMessages.length - 1 || chatMessages[idx + 1]?.direction === 'OUTBOUND');
              
              return (
                <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] ${isOutbound ? 'self-end' : 'self-start'}`}>
                  {!isOutbound && (
                    <div className="w-8 shrink-0">
                      {showAvatar && (
                        <Avatar className="h-8 w-8 mb-1">
                          <AvatarImage src={conversation.contact?.avatarUrl || ""} />
                          <AvatarFallback>
                            {(conversation.contact?.name || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  
                  <div className={`p-2 px-3 rounded-2xl shadow-sm ${
                    isOutbound 
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-br-sm border border-[#c1ecc8] dark:border-[#005c4b]' 
                      : 'bg-[var(--background)] rounded-bl-sm border border-[var(--border)]'
                  }`}>
                    <div className={`${isOutbound ? 'text-[#111b21] dark:text-[#e9edef]' : 'text-[var(--foreground)]'}`}>
                      {renderMessageContent(msg)}
                    </div>
                    <div className="flex justify-end items-center mt-1 gap-1">
                      <span className={`text-[11px] ${isOutbound ? 'text-[#667781] dark:text-[#8696a0]' : 'text-[var(--muted-foreground)]'}`}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isOutbound && (
                        msg.status === 'READ' ? <CheckCheck className="h-3 w-3 text-blue-500" /> :
                        msg.status === 'DELIVERED' ? <CheckCheck className="h-3 w-3 text-[#667781] dark:text-[#8696a0]" /> :
                        msg.status === 'SENT' ? <Check className="h-3 w-3 text-[#667781] dark:text-[#8696a0]" /> :
                        <Loader2 className="h-3 w-3 animate-spin text-[#667781] dark:text-[#8696a0]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Composer */}
      <div className="p-3 bg-[var(--background)] border-t border-[var(--border)] shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          
          {/* Attachment Preview */}
          {attachment && (
            <div className="flex items-center gap-3 p-2 bg-[var(--muted)] rounded-lg w-fit relative pr-8">
              {attachment.type.startsWith('image/') ? (
                <ImageIcon className="h-10 w-10 text-[var(--muted-foreground)]" />
              ) : (
                <FileText className="h-10 w-10 text-[var(--muted-foreground)]" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[200px]">{attachment.name}</span>
                <span className="text-xs text-[var(--muted-foreground)]">Attached</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => setAttachment(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="mb-1 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full h-10 w-10">
                    <Smile className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Emoji</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="mb-1 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-full h-10 w-10 flex items-center justify-center cursor-pointer transition-colors">
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </TooltipTrigger>
                <TooltipContent side="top">Attach file</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex-1 bg-[var(--muted)]/50 rounded-2xl border border-[var(--border)] flex items-end p-1 focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all">
              <Textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message" 
                className="min-h-[44px] max-h-32 border-0 focus-visible:ring-0 bg-transparent resize-none py-3 px-4 w-full"
                rows={1}
              />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    disabled={(!inputMessage.trim() && !attachment) || isUploading}
                    className={`mb-1 shrink-0 rounded-full h-11 w-11 transition-all ${inputMessage.trim() || attachment ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}
                  >
                    <Send className="h-5 w-5 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Send message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
