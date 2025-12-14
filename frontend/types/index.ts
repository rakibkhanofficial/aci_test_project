import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_path?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface FileUpload {
  filename: string;
  filepath: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}