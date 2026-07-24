"use client";

import { useState } from "react";
import { ConversationList } from "@/components/inbox/ConversationList";
import { ChatWindow } from "@/components/inbox/ChatWindow";
import { ContactContext } from "@/components/inbox/ContactContext";

export default function InboxPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(true);

  return (
    <div className="h-[calc(100vh-8rem)] -mx-6 -mt-6 -mb-6 flex overflow-hidden border-t border-[var(--border)]">
      
      {/* Left Pane: Conversation List */}
      <div 
        className={`w-full md:w-[320px] lg:w-[380px] shrink-0 transition-all ${
          activeChatId ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList 
          activeId={activeChatId} 
          onSelect={(id) => setActiveChatId(id)} 
        />
      </div>

      {/* Center Pane: Chat Window */}
      <div 
        className={`flex-1 min-w-0 transition-all ${
          !activeChatId ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatWindow activeId={activeChatId} />
      </div>

      {/* Right Pane: Contact Context */}
      {activeChatId && showContext && (
        <div className="w-[320px] shrink-0 hidden lg:block transition-all border-l border-[var(--border)]">
          <ContactContext 
            activeId={activeChatId} 
            onClose={() => setShowContext(false)} 
          />
        </div>
      )}
    </div>
  );
}
