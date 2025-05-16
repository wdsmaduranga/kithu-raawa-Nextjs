export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface ChatProps {
  sessionId: number;
  userId: number;
}

export interface ChatSession {
  // unread: number;
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
  user?: User;
}

export interface Message {
  // content: any;
  id: number;
  chat_session_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  status: 'sent' | 'delivered' | 'seen';
  delivered_at: string | null;
  seen_at: string | null;
  sender?: User;
  receiver?: User;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_role: number;
  avatar?: string;
  avatar_url?: string;
  isReverendFather: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceConsultant {
  id: number;
  user_id: number;
  services_id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}