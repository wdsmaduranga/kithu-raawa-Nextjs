import axios from 'axios';
import { getCookie } from 'cookies-next';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = getCookie("token");
    // const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createChatSession = async (categoryId: number, message: string) => {
  const response = await api.post('/chat-sessions', {
    category_id: categoryId,
    initial_message: message,
  });
  return response.data;
};

export const sendMessage = async (sessionId: number, message: string) => {
  const response = await api.post(`/chat-sessions/${sessionId}/messages`, {
    message,
  });
  return response.data;
};

export const getMessages = async (sessionId: number) => {
  const response = await api.get(`/chat-sessions/${sessionId}/messages`);
  return response.data;
};

// Reverend Father specific endpoints
export const getChatSessions = async () => {
  const response = await api.get('/reverend/chat-sessions');
  return response.data;
};

export const getChatSession = async (sessionId: number) => {
  const response = await api.get(`/chat-sessions/${sessionId}`);
  return response.data;
};
export const activeChatSession = async () => {
  const response = await api.get(`/chat-session/active`);
  // http://127.0.0.1:8000/api/chat-sessions/active
  return response.data;
};
export const acceptChatSession = async (sessionId: number) => {
  const response = await api.post(`/reverend/chat-sessions/${sessionId}/accept`);
  return response.data;
};
export const closeChatSession = async (sessionId: number) => {
  const response = await api.post(`/reverend/chat-sessions/${sessionId}/close`);
  return response.data;
};

export const markMessageAsDelivered = async (messageId: number) => {
  const response = await api.post(`/messages/${messageId}/delivered`);
  return response.data;
};

export const markMessageAsSeen = async (messageId: number) => {
  const response = await api.post(`/messages/${messageId}/seen`);
  return response.data;
};
// const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-sessions/${session.id}/unread-count`, {
export const unreadCount = async (sessionId: number) => {
    const response = await api.get(`/chat-sessions/${sessionId}/unread-count`);
    return response.data;
  };

  export const SessionLatestMessage = async (sessionId: number) => {
    const response = await api.get(`/chat-sessions/${sessionId}/latest-message`);
    return response.data;
  };

  // Reverend Father specific endpoints
export const getuserChatSessions = async () => {
  const response = await api.get('/chat-sessions');
  return response.data;
};

export const getAllChatSessions = async () => {
  const response = await api.get('/chat-session/all');
  return response.data;
};

// Call related endpoints
export const initiateCall = async (sessionId: number) => {
  const response = await api.post(`/call/${sessionId}/initiate`);
  return response.data;
};

export const getCallToken = async (sessionId: number) => {
  const response = await api.get(`/call/${sessionId}/token`);
  return response.data;
};

export const acceptCall = async (sessionId: number) => {
  const response = await api.post(`/call/${sessionId}/accept`);
  return response.data;
};

export const endCall = async (sessionId: number) => {
  const response = await api.post(`/call/${sessionId}/end`);
  return response.data;
};

export const rejectCall = async (sessionId: number) => {
  const response = await api.post(`/call/${sessionId}/reject`);
  return response.data;
};

// News related endpoints
export const getAllNews = async () => {
  const response = await api.get('/news');
  return response.data;
};

export const createNews = async (newsData: {
  post_title: string;
  post_body: string;
  post_catgry_id: number;
}) => {
  const response = await api.post('/news', newsData);
  return response.data;
};

export const getNewsById = async (id: number) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const updateNews = async (
  id: number,
  newsData: {
    post_title: string;
    post_body: string;
    post_catgry_id: number;
  }
) => {
  const response = await api.put(`/news/${id}`, newsData);
  return response.data;
};

export const deleteNews = async (id: number) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};
