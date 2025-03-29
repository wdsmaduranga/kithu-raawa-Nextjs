import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
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

export const acceptChatSession = async (sessionId: number) => {
  const response = await api.post(`/chat-sessions/${sessionId}/accept`);
  return response.data;
};
export const closeChatSession = async (sessionId: number) => {
  const response = await api.post(`/chat-sessions/${sessionId}/close`);
  return response.data;
};