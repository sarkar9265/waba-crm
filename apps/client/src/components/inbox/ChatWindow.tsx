"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage, Button, ScrollArea, Textarea, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge } from "@algo-matrix/ui";
import { Check, CheckCheck, Paperclip, Send, Smile, Phone, MoreVertical, Search, FileText } from "lucide-react";

export function ChatWindow({ activeId }: { activeId: string | null }) {
  const [inputMessage, setInputMessage] = useState("");

  if (!activeId) {
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

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a]">
      {/* Chat Header */}
      <div className="h-16 border-b border-[var(--border)] bg-[var(--background)] px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-[var(--primary)] text-white">JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-[var(--foreground)] leading-none mb-1">John Doe</h2>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-[var(--muted-foreground)]">
            <Phone className="h-5 w-5" />
          </Button>
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
        <div className="flex flex-col gap-4 py-4 max-w-3xl mx-auto">
          {/* Date Badge */}
          <div className="flex justify-center my-2">
            <span className="bg-[var(--background)]/80 backdrop-blur text-xs font-medium px-3 py-1 rounded-lg text-[var(--muted-foreground)] shadow-sm">
              TODAY
            </span>
          </div>

          {/* Incoming Message */}
          <div className="flex items-end gap-2 self-start max-w-[85%]">
            <Avatar className="h-8 w-8 shrink-0 mb-1">
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="bg-[var(--background)] p-3 rounded-2xl rounded-bl-sm shadow-sm border border-[var(--border)]">
              <p className="text-[var(--foreground)] text-[15px] leading-relaxed">
                Hi! I was wondering if you offer enterprise plans with custom integrations?
              </p>
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-[11px] text-[var(--muted-foreground)]">10:40 AM</span>
              </div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex items-end gap-2 self-end max-w-[85%]">
            <div className="bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-2xl rounded-br-sm shadow-sm border border-[#c1ecc8] dark:border-[#005c4b]">
              <p className="text-[#111b21] dark:text-[#e9edef] text-[15px] leading-relaxed">
                Hello John! Yes, we absolutely do. Our Enterprise plan includes custom API integrations and dedicated support. Would you like me to send over our brochure?
              </p>
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">10:41 AM</span>
                <CheckCheck className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Incoming Message */}
          <div className="flex items-end gap-2 self-start max-w-[85%]">
            <Avatar className="h-8 w-8 shrink-0 mb-1">
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="bg-[var(--background)] p-3 rounded-2xl rounded-bl-sm shadow-sm border border-[var(--border)]">
              <p className="text-[var(--foreground)] text-[15px] leading-relaxed">
                Thanks for the update! Yes please.
              </p>
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-[11px] text-[var(--muted-foreground)]">10:42 AM</span>
              </div>
            </div>
          </div>
          
          {/* Template Message (Outgoing) */}
          <div className="flex items-end gap-2 self-end max-w-[85%]">
            <div className="bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-2xl rounded-br-sm shadow-sm border border-[#c1ecc8] dark:border-[#005c4b] w-full sm:w-[350px]">
              <div className="flex items-center gap-2 mb-2 p-2 bg-black/5 dark:bg-black/20 rounded-md">
                <FileText className="h-8 w-8 text-[#111b21] dark:text-[#e9edef] opacity-70" />
                <div>
                  <p className="text-sm font-medium text-[#111b21] dark:text-[#e9edef]">Enterprise_Brochure.pdf</p>
                  <p className="text-xs text-[#667781] dark:text-[#8696a0]">2.4 MB • PDF</p>
                </div>
              </div>
              <p className="text-[#111b21] dark:text-[#e9edef] text-[15px] leading-relaxed">
                Here is the brochure as requested. Let me know if you want to jump on a quick call to discuss your integration needs!
              </p>
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">10:45 AM</span>
                <Check className="h-3 w-3 text-[#667781] dark:text-[#8696a0]" />
              </div>
            </div>
          </div>

        </div>
      </ScrollArea>

      {/* Message Composer */}
      <div className="p-3 bg-[var(--background)] border-t border-[var(--border)] shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
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
                <Button variant="ghost" size="icon" className="mb-1 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full h-10 w-10">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex-1 bg-[var(--muted)]/50 rounded-2xl border border-[var(--border)] flex items-end p-1 focus-within:ring-1 focus-within:ring-[var(--primary)] focus-within:border-[var(--primary)] transition-all">
            <Textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
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
                  className={`mb-1 shrink-0 rounded-full h-11 w-11 transition-all ${inputMessage.trim() ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}
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
  );
}

// Ensure MessageSquare is imported if used in fallback
import { MessageSquare } from "lucide-react";
