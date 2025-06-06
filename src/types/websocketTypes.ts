// types/websocket.types.ts

/**
 * Core data types that match your Laravel models
 * These types ensure that our frontend expectations match the backend reality
 */

// The Protocol type matches your protocols table structure
export interface Protocol {
  id: string;
  client_id: string;
  assistant_id: string;
  assistant_phone_id: string | null;
  source: string;
  identifier: string;
  thread_id: string;
  operator: boolean;
  created_at: string;
  updated_at: string;
}

// The Question type matches your questions table
export interface Question {
  id: string;
  thread_id: string | null;
  run_id: string | null;
  tool_call_id: string | null;
  role: 'user' | 'assistant' | 'system';
  operator: boolean;
  answered: boolean;
  approoved: boolean; // Note: keeping your spelling from the migration
  content: string;
  protocol: string; // This is the protocol ID
  token: number | null;
  created_at: string;
  updated_at: string;
}

// The Reply type matches your replies table
export interface Reply {
  id: string;
  question_id: string;
  role: 'assistant' | 'user';
  approoved: boolean;
  content: string;
  protocol: string;
  created_at: string;
  updated_at: string;
  // We might receive question data with the reply
  question?: {
    id: string;
    content: string;
  };
}

// The OperatorReply type matches your operator_replies table
export interface OperatorReply {
  id: string;
  protocol: string;
  content: string;
  role: 'operator';
  created_at: string;
  updated_at: string;
}

/**
 * WebSocket event types
 * These define the shape of data we receive from broadcast events
 */

// Base event structure that all events share
interface BaseEvent {
  protocol_id: string;
  created_at: string;
}

// Event received when a new question is created
export interface QuestionCreatedEvent extends BaseEvent {
  id: string;
  thread_id: string | null;
  run_id: string | null;
  tool_call_id: string | null;
  role: 'user' | 'assistant' | 'system';
  operator: boolean;
  answered: boolean;
  approved: boolean; // Note: the event uses 'approved', not 'approoved'
  content: string;
  token: number | null;
}

// Event received when a new reply is created
export interface ReplyCreatedEvent extends BaseEvent {
  id: string;
  question_id: string;
  role: 'assistant' | 'user';
  approved: boolean;
  content: string;
  question: {
    id: string;
    content: string;
  };
}

// Event received when an operator replies
export interface OperatorReplyCreatedEvent extends BaseEvent {
  id: string;
  content: string;
  role: 'operator';
}

/**
 * Unified message type for displaying in the UI
 * This is what we store in our component state
 */
export type MessageType = 'question' | 'reply' | 'operator_reply';

export interface UnifiedMessage {
  id: string;
  type: MessageType;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'operator';
  timestamp: string;
  operator?: boolean;
  answered?: boolean;
  approved?: boolean;
  question_id?: string;
}

/**
 * WebSocket connection states
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Hook return types
 */
export interface UseProtocolChannelReturn {
  channel: any; // We'll keep this as 'any' since Echo's channel type is complex
  listen: (event: string, callback: (data: any) => void) => void;
  stopListening: (event: string) => void;
  connectionStatus: ConnectionStatus;
}
