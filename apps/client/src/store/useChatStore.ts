import { create } from 'zustand';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

export type Conversation = {
  id: string;
  clientId: string;
  contactId: string;
  assignedToId: string | null;
  status: string;
  priority: string;
  isArchived: boolean;
  isStarred: boolean;
  slaTimer: string | null;
  labels: string[];
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  contact: any;
  messages: Message[];
  assignedTo: any | null;
  unreadCount?: number;
};

export type Message = {
  id: string;
  conversationId: string;
  wamid: string | null;
  type: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  interactiveData: any | null;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  isDeleted: boolean;
  replyToId: string | null;
  isPinned?: boolean;
  createdAt: string;
};

interface ChatState {
  socket: Socket | null;
  users: any[];
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // Keyed by conversationId
  loadingConversations: boolean;
  loadingMessages: Record<string, boolean>;
  hasMoreConversations: boolean;
  page: number;
  hasMoreMessages: Record<string, boolean>;
  messageCursors: Record<string, string | null>;
  typingIndicators: Record<string, { userId: string; timestamp: number }[]>;
  onlineUsers: string[];

  // Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;
  fetchConversations: (filters?: any) => Promise<void>;
  fetchMoreConversations: (filters?: any) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, data: any) => Promise<void>;
  updateMessage: (conversationId: string, messageId: string, data: any) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  updateConversation: (id: string, data: any) => Promise<void>;
  bulkUpdateConversations: (ids: string[], data: any) => Promise<void>;
  fetchUsers: () => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  clearStaleTypingIndicators: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  users: [],
  conversations: [],
  activeConversationId: null,
  messages: {},
  loadingConversations: false,
  loadingMessages: {},
  hasMoreConversations: true,
  page: 1,
  hasMoreMessages: {},
  messageCursors: {},
  typingIndicators: {},
  onlineUsers: [],

  initializeSocket: () => {
    const { socket } = get();
    if (socket) return;

    const token = Cookies.get('waba_token');
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'https://api.algomatrixai.com', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Chat socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect(); // manually reconnect if server disconnected
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
    });

    newSocket.on('typing', (data: { conversationId: string, isTyping: boolean, userId: string }) => {
      set((state) => {
        const { conversationId, isTyping, userId } = data;
        const currentIndicators = state.typingIndicators[conversationId] || [];
        
        let newIndicators = currentIndicators.filter(i => i.userId !== userId);
        
        if (isTyping) {
          newIndicators.push({ userId, timestamp: Date.now() });
        }
        
        return {
          typingIndicators: {
            ...state.typingIndicators,
            [conversationId]: newIndicators
          }
        };
      });
    });

    newSocket.on('presence', (data: { userId: string, status: 'online' | 'offline' }) => {
      set((state) => {
        let newOnline = [...state.onlineUsers];
        if (data.status === 'online' && !newOnline.includes(data.userId)) {
          newOnline.push(data.userId);
        } else if (data.status === 'offline') {
          newOnline = newOnline.filter(id => id !== data.userId);
        }
        return { onlineUsers: newOnline };
      });
    });

    newSocket.on('new_message', (msg: Message) => {
      set((state) => {
        // Add message to messages list
        const conversationMessages = state.messages[msg.conversationId] || [];
        const isDuplicate = conversationMessages.some((m) => m.id === msg.id);
        
        let newMessages = state.messages;
        if (!isDuplicate) {
          newMessages = {
            ...state.messages,
            [msg.conversationId]: [...conversationMessages, msg],
          };
        }

        // Update conversation preview and unread count
        const updatedConversations = state.conversations.map((conv) => {
          if (conv.id === msg.conversationId) {
            return {
              ...conv,
              messages: [msg],
              updatedAt: msg.createdAt,
              unreadCount: msg.direction === 'INBOUND' && state.activeConversationId !== msg.conversationId
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return { messages: newMessages, conversations: updatedConversations };
      });
    });

    newSocket.on('message_status', (statusUpdate: any) => {
      set((state) => {
        const newMessages = { ...state.messages };
        let found = false;
        
        for (const [convId, msgs] of Object.entries(newMessages)) {
          const idx = msgs.findIndex((m) => m.wamid === statusUpdate.id);
          if (idx !== -1) {
            msgs[idx] = { ...msgs[idx], status: statusUpdate.status.toUpperCase() };
            found = true;
            break;
          }
        }
        
        return found ? { messages: newMessages } : state;
      });
    });

    newSocket.on('conversation_updated', (updatedConv: any) => {
      set((state) => ({
        conversations: state.conversations.map((c) => 
          c.id === updatedConv.id ? { ...c, ...updatedConv } : c
        )
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async (filters: any = {}) => {
    set({ loadingConversations: true, page: 1 });
    try {
      const res = await api.get('/chat/conversations', { params: { ...filters, page: 1, limit: 20 } });
      set({ 
        conversations: res.data, 
        loadingConversations: false,
        hasMoreConversations: res.data.length === 20
      });
    } catch (error) {
      console.error('Failed to fetch conversations', error);
      set({ loadingConversations: false });
    }
  },

  fetchMoreConversations: async (filters: any = {}) => {
    const { page, hasMoreConversations, loadingConversations } = get();
    if (!hasMoreConversations || loadingConversations) return;

    set({ loadingConversations: true });
    try {
      const nextPage = page + 1;
      const res = await api.get('/chat/conversations', { params: { ...filters, page: nextPage, limit: 20 } });
      
      set((state) => ({ 
        conversations: [...state.conversations, ...res.data],
        page: nextPage,
        loadingConversations: false,
        hasMoreConversations: res.data.length === 20
      }));
    } catch (error) {
      console.error('Failed to fetch more conversations', error);
      set({ loadingConversations: false });
    }
  },

  setActiveConversation: (id: string | null) => {
    set((state) => {
      // Clear unread count when opening
      let updatedConversations = state.conversations;
      if (id) {
        updatedConversations = state.conversations.map((c) => 
          c.id === id ? { ...c, unreadCount: 0 } : c
        );
      }
      return { activeConversationId: id, conversations: updatedConversations };
    });
  },

  fetchMessages: async (conversationId: string) => {
    set((state) => ({ loadingMessages: { ...state.loadingMessages, [conversationId]: true } }));
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages?limit=20`);
      set((state) => ({
        messages: { ...state.messages, [conversationId]: res.data.messages || res.data },
        loadingMessages: { ...state.loadingMessages, [conversationId]: false },
        hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: res.data.hasMore ?? false },
        messageCursors: { ...state.messageCursors, [conversationId]: res.data.nextCursor ?? null }
      }));
    } catch (error) {
      console.error('Failed to fetch messages', error);
      set((state) => ({ loadingMessages: { ...state.loadingMessages, [conversationId]: false } }));
    }
  },

  fetchMoreMessages: async (conversationId: string) => {
    const { messageCursors, hasMoreMessages, loadingMessages } = get();
    if (!hasMoreMessages[conversationId] || loadingMessages[conversationId]) return;

    const cursor = messageCursors[conversationId];
    if (!cursor) return;

    set((state) => ({ loadingMessages: { ...state.loadingMessages, [conversationId]: true } }));
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages?limit=20&cursor=${cursor}`);
      set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        const newMessages = res.data.messages || res.data;
        // Prepend because older messages come from cursor
        // Wait, the API usually returns ascending? We need to make sure we don't duplicate
        // Just prepend if it's returning older messages
        return {
          messages: { ...state.messages, [conversationId]: [...newMessages, ...currentMessages] },
          loadingMessages: { ...state.loadingMessages, [conversationId]: false },
          hasMoreMessages: { ...state.hasMoreMessages, [conversationId]: res.data.hasMore ?? false },
          messageCursors: { ...state.messageCursors, [conversationId]: res.data.nextCursor ?? null }
        };
      });
    } catch (error) {
      console.error('Failed to fetch more messages', error);
      set((state) => ({ loadingMessages: { ...state.loadingMessages, [conversationId]: false } }));
    }
  },

  sendMessage: async (conversationId: string, data: any) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      wamid: null,
      type: data.type || 'text',
      content: data.content,
      mediaUrl: data.mediaUrl || null,
      mediaType: data.mediaType || null,
      interactiveData: data.interactiveData || null,
      direction: 'OUTBOUND',
      status: 'SENDING',
      isDeleted: false,
      replyToId: data.replyToId || null,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const convMsgs = state.messages[conversationId] || [];
      return {
        messages: { ...state.messages, [conversationId]: [...convMsgs, optimisticMessage] }
      };
    });

    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, data);
      
      // Replace optimistic message with real one
      set((state) => {
        const convMsgs = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: convMsgs.map(m => m.id === tempId ? res.data : m)
          }
        };
      });
    } catch (error) {
      console.error('Failed to send message', error);
      // Mark optimistic message as failed
      set((state) => {
        const convMsgs = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: convMsgs.map(m => m.id === tempId ? { ...m, status: 'FAILED' } : m)
          }
        };
      });
    }
  },

  updateMessage: async (conversationId: string, messageId: string, data: any) => {
    try {
      const res = await api.patch(`/chat/messages/${messageId}`, data);
      set((state) => {
        const convMsgs = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: convMsgs.map(m => m.id === messageId ? { ...m, ...res.data } : m)
          }
        };
      });
    } catch (error) {
      console.error('Failed to update message', error);
    }
  },

  deleteMessage: async (conversationId: string, messageId: string) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      set((state) => {
        const convMsgs = state.messages[conversationId] || [];
        return {
          messages: {
            ...state.messages,
            [conversationId]: convMsgs.filter(m => m.id !== messageId)
          }
        };
      });
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  },

  updateConversation: async (id: string, data: any) => {
    try {
      const res = await api.patch(`/chat/conversations/${id}`, data);
      set((state) => ({
        conversations: state.conversations.map(c => c.id === id ? { ...c, ...res.data } : c)
      }));
    } catch (error) {
      console.error('Failed to update conversation', error);
    }
  },

  bulkUpdateConversations: async (ids: string[], data: any) => {
    try {
      await api.patch(`/chat/conversations`, { ids, data });
      // The socket event 'conversation_updated' will handle updating the UI for each conversation.
      // But we can also optimistically update:
      set((state) => ({
        conversations: state.conversations.map(c => 
          ids.includes(c.id) ? { ...c, ...data } : c
        )
      }));
    } catch (error) {
      console.error('Failed to bulk update conversations', error);
    }
  },

  fetchUsers: async () => {
    try {
      const res = await api.get('/users');
      set({ users: res.data });
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  },

  setTyping: (conversationId: string, isTyping: boolean) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing', { conversationId, isTyping });
    }
  },

  clearStaleTypingIndicators: () => {
    set((state) => {
      const now = Date.now();
      const updated: Record<string, { userId: string; timestamp: number }[]> = {};
      let hasChanges = false;
      
      for (const [convId, indicators] of Object.entries(state.typingIndicators)) {
        const valid = indicators.filter(i => now - i.timestamp < 5000); // 5 seconds expiry
        if (valid.length !== indicators.length) hasChanges = true;
        if (valid.length > 0) updated[convId] = valid;
      }
      
      return hasChanges ? { typingIndicators: updated } : state;
    });
  }
}));
