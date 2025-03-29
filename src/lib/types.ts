export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  reverend_id: number | null;
  category_id: number;
  category?: Category;
  status: 'waiting' | 'active' | 'closed';
  initial_message: string;
  accepted_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_session_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  user_role: number; // 0: regular user, 1: admin, 2: reverend father
  created_at: string;
  updated_at: string;
}