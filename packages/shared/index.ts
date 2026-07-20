// Shared Interfaces for the Monorepo

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string | number;
  type: 'INBOUND' | 'OUTBOUND';
}

export interface MessageStatusUpdate {
  id: string;
  status: string;
  recipient_id: string;
}

export interface ServerToClientEvents {
  new_message: (message: ChatMessage) => void;
  message_status: (status: MessageStatusUpdate) => void;
}

export interface ClientToServerEvents {
  join_room: (tenantId: string) => void;
  send_message: (payload: { to: string; text: string; tenantId: string }) => void;
}

export interface BillingOrderPayload {
  clientId: string;
  planName: string;
  amount: number;
}
