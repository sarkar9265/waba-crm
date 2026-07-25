"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button, ScrollArea, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Input, Popover, PopoverTrigger, PopoverContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@algo-matrix/ui";
import { Check, CheckCheck, Paperclip, Send, Smile, Phone, MoreVertical, Search, FileText, Image as ImageIcon, X, Loader2, MessageSquare, Video, Mic, MapPin, UserSquare, MousePointerClick, Reply, Forward, Trash2, Copy, Pin } from "lucide-react";
import { useChatStore, Message } from "@/store/useChatStore";
import { format, isToday, isYesterday } from "date-fns";
import { api } from "@/lib/api";
import EmojiPicker from 'emoji-picker-react';

export function ChatWindow({ activeId }: { activeId: string | null }) {
  const [inputMessage, setInputMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { conversations, messages, loadingMessages, fetchMessages, fetchMoreMessages, hasMoreMessages, sendMessage, updateMessage, deleteMessage, socket, setTyping, typingIndicators, clearStaleTypingIndicators, onlineUsers } = useChatStore();
  const conversation = conversations.find(c => c.id === activeId);
  const chatMessages = activeId ? messages[activeId] || [] : [];
  const isLoading = activeId ? loadingMessages[activeId] : false;

  useEffect(() => {
    if (activeId && !messages[activeId] && !loadingMessages[activeId]) {
      fetchMessages(activeId);
    }
  }, [activeId, messages, loadingMessages, fetchMessages]);

  useEffect(() => {
    const interval = setInterval(clearStaleTypingIndicators, 2000);
    return () => clearInterval(interval);
  }, [clearStaleTypingIndicators]);

  useEffect(() => {
    if (scrollRef.current && !loadingMessages[activeId!]) {
      // Only scroll to bottom on initial load or new message
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length === 0, messages[activeId!]?.[messages[activeId!]?.length - 1]?.id]);

  useEffect(() => {
    if (loadingMessages[activeId!]) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreMessages[activeId!]) {
        fetchMoreMessages(activeId!);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activeId, hasMoreMessages, loadingMessages, fetchMoreMessages]);

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
      mediaType: attachment?.type || null,
      replyToId: replyingTo?.id || null
    };

    setInputMessage("");
    setAttachment(null);
    setReplyingTo(null);
    setIsEmojiPickerOpen(false);
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

  const processFile = (file: File) => {
    // Re-use the upload logic
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileUpload(fakeEvent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      processFile(e.clipboardData.files[0]);
    }
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDelete = async (messageId: string) => {
    if (activeId) await deleteMessage(activeId, messageId);
  };

  const handlePin = async (messageId: string, isPinned: boolean) => {
    if (activeId) await updateMessage(activeId, messageId, { isPinned: !isPinned });
  };

  const onEmojiClick = (emojiData: any) => {
    setInputMessage(prev => prev + emojiData.emoji);
  };

  const handleForward = async (convId: string) => {
    if (!forwardingMessage) return;
    const payload = {
      content: forwardingMessage.content,
      type: forwardingMessage.type,
      mediaUrl: forwardingMessage.mediaUrl,
      mediaType: forwardingMessage.mediaType,
      interactiveData: forwardingMessage.interactiveData
    };
    await sendMessage(convId, payload);
    setForwardingMessage(null);
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
    if (msg.type === 'video' && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          <video controls className="rounded-lg max-w-sm max-h-64 object-cover bg-black">
            <source src={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} />
          </video>
          {msg.content && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    if ((msg.type === 'audio' || msg.type === 'voice') && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1 bg-black/5 dark:bg-white/5 p-2 rounded-full min-w-[200px]">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
            <audio controls className="h-8 max-w-[200px]">
              <source src={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} />
            </audio>
          </div>
        </div>
      );
    }
    if (msg.type === 'sticker' && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          <img src={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} alt="sticker" className="w-32 h-32 object-contain" />
        </div>
      );
    }
    if (msg.type === 'document' && msg.mediaUrl) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-md">
            <FileText className="h-6 w-6 opacity-70" />
            <a href={process.env.NEXT_PUBLIC_API_URL + msg.mediaUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">
              Document Attachment
            </a>
          </div>
          {msg.content && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    if (msg.type === 'location') {
      const lat = msg.interactiveData?.latitude || '';
      const lng = msg.interactiveData?.longitude || '';
      const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[var(--primary)] mb-1">
            <MapPin className="h-4 w-4" /> <span className="font-semibold text-sm">Location Shared</span>
          </div>
          {lat && lng ? (
             <iframe width="250" height="150" src={mapUrl} className="rounded-md border-0" allowFullScreen></iframe>
          ) : (
            <p className="text-sm italic opacity-70">Invalid location data</p>
          )}
        </div>
      );
    }
    if (msg.type === 'contacts') {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-[var(--primary)] mb-1">
            <UserSquare className="h-4 w-4" /> <span className="font-semibold text-sm">Contact Shared</span>
          </div>
          {msg.interactiveData?.map((contact: any, i: number) => (
             <div key={i} className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2 rounded-md">
               <Avatar className="h-8 w-8"><AvatarFallback>{contact.name?.formatted_name?.charAt(0) || 'C'}</AvatarFallback></Avatar>
               <span className="text-sm font-medium">{contact.name?.formatted_name}</span>
             </div>
          ))}
        </div>
      );
    }
    if (msg.type === 'interactive' || msg.type === 'list' || msg.type === 'template') {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content || (msg.type === 'template' ? '[Template Message]' : '[Interactive Message]')}</p>
          <div className="flex flex-col gap-1 mt-1 border-t border-[var(--border)] pt-2">
            <div className="flex items-center gap-1 text-[var(--primary)] justify-center">
               <MousePointerClick className="h-4 w-4" /> <span className="text-xs uppercase font-bold tracking-wider">{msg.type}</span>
            </div>
            {/* We can render the buttons if interactiveData is structured, for now just show a generic button preview */}
            {msg.interactiveData?.buttons?.map((btn: any, i: number) => (
               <button key={i} className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors py-2 rounded-md text-sm font-medium text-[var(--primary)] text-center w-full mt-1">
                 {btn.title || btn.text || 'Button'}
               </button>
            ))}
          </div>
        </div>
      );
    }
    return <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white dark:bg-[#1f2c34] p-8 rounded-2xl flex flex-col items-center shadow-xl">
             <Paperclip className="h-12 w-12 text-[var(--primary)] mb-4 animate-bounce" />
             <h3 className="text-xl font-bold">Drop files here</h3>
             <p className="text-[var(--muted-foreground)] mt-2">Attach images, videos, or documents</p>
           </div>
        </div>
      )}

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
            {activeId && typingIndicators[activeId] && typingIndicators[activeId].length > 0 && (
              <p className="text-xs text-[var(--primary)] animate-pulse">
                Agent is typing...
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isSearchOpen && (
            <Input 
              autoFocus
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 mr-2"
            />
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className={`text-[var(--muted-foreground)] ${isSearchOpen ? 'bg-[var(--accent)] text-[var(--foreground)]' : ''}`}>
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
            {hasMoreMessages[activeId!] && (
              <div ref={loadMoreRef} className="w-full flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
              </div>
            )}
            {chatMessages
              .filter(m => !searchQuery || m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((msg, idx) => {
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
                  
                  <div className={`p-2 px-3 rounded-2xl shadow-sm relative group ${
                    isOutbound 
                      ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-br-sm border border-[#c1ecc8] dark:border-[#005c4b]' 
                      : 'bg-[var(--background)] rounded-bl-sm border border-[var(--border)]'
                  }`}>
                    {msg.isPinned && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-0.5 shadow-sm">
                        <Pin className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => setReplyingTo(msg)}>
                            <Reply className="mr-2 h-4 w-4" /> Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(msg.content)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setForwardingMessage(msg)}>
                            <Forward className="mr-2 h-4 w-4" /> Forward
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePin(msg.id, !!msg.isPinned)}>
                            <Pin className="mr-2 h-4 w-4" /> {msg.isPinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(msg.id)} className="text-red-500 hover:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {msg.replyToId && (
                       <div className="bg-black/5 dark:bg-black/20 p-2 rounded-md mb-2 border-l-4 border-[var(--primary)] text-sm opacity-80">
                         Replying to a message
                       </div>
                    )}

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
          
          {replyingTo && (
            <div className="flex items-center justify-between bg-[var(--muted)]/50 p-2 rounded-lg border-l-4 border-[var(--primary)] text-sm">
              <div className="flex flex-col truncate">
                <span className="font-semibold text-[var(--primary)]">Replying to</span>
                <span className="truncate opacity-80">{replyingTo.content || '[Media]'}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)} className="h-6 w-6 rounded-full shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

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
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="mb-1 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full h-10 w-10">
                  <Smile className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="p-0 border-0 bg-transparent shadow-none w-auto">
                <EmojiPicker onEmojiClick={onEmojiClick} theme={'auto' as any} />
              </PopoverContent>
            </Popover>

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
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  if (activeId) {
                    setTyping(activeId, true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setTyping(activeId, false), 3000);
                  }
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
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

      <Dialog open={!!forwardingMessage} onOpenChange={(open) => !open && setForwardingMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Message To</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-64 mt-2">
            <div className="flex flex-col gap-2 p-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleForward(conv.id)}
                  className="flex items-center gap-3 w-full p-2 hover:bg-[var(--accent)] rounded-lg transition-colors text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conv.contact?.avatarUrl || ""} />
                    <AvatarFallback>{(conv.contact?.name || conv.contact?.phone || "U").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-sm truncate">{conv.contact?.name || conv.contact?.phone}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
