"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/inbox/ConversationList";
import { ChatWindow } from "@/components/inbox/ChatWindow";
import { ContactContext } from "@/components/inbox/ContactContext";
import { useChatStore } from "@/store/useChatStore";

export default function InboxPage() {
  const [showContext, setShowContext] = useState(true);
  const { activeConversationId, setActiveConversation, initializeSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    initializeSocket();
    return () => disconnectSocket();
  }, [initializeSocket, disconnectSocket]);

  return (
    <div className="h-[calc(100vh-8rem)] -mx-6 -mt-6 -mb-6 flex overflow-hidden border-t border-[var(--border)]">
      
      {/* Left Pane: ConversationList */}
      <div 
        className={`w-full md:w-[320px] lg:w-[380px] shrink-0 transition-all ${
          activeConversationId ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList 
          activeId={activeConversationId} 
          onSelect={(id) => setActiveConversation(id)} 
        />
      </div>

      {/* Center Pane: Chat Window */}
      <div 
        className={`flex-1 min-w-0 transition-all ${
          !activeConversationId ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatWindow activeId={activeConversationId} />
      </div>

      {/* Right Pane: Contact Context */}
      {activeConversationId && showContext && (
        <div className="w-[320px] shrink-0 hidden lg:block transition-all border-l border-[var(--border)]">
          <ContactContext 
            activeId={activeConversationId} 
            onClose={() => setShowContext(false)} 
          />
        </div>
      )}
    </div>
  );
}
