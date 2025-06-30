import { ObjectId } from 'mongodb';

export interface ChatMessage {
  _id?: ObjectId;
  userId: string;
  role: 'user' | 'model' | 'system'; // 'system' could be for initial prompt or context
  content: string; // For text messages
  // If supporting function calls and their results directly in history:
  // functionCall?: { name: string; args: any };
  // functionResponse?: { name: string; response: any };
  timestamp: Date;
}

export interface ChatSession {
  _id?: ObjectId;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[]; // Or reference to a messages collection by session ID
  // Potentially other session metadata
  // title?: string; // e.g. auto-generated title from first few messages
}
