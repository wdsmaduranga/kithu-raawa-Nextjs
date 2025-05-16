'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatSession, Message } from '@/lib/types';
import { useUserStore } from '@/stores/userStore';
import { formatDistanceToNow } from 'date-fns';
import { getCookie } from 'cookies-next';
import Pusher from 'pusher-js';

interface ChatWindowProps {
  onMessageRead?: () => void;
}

export function ChatWindow({ onMessageRead }: ChatWindowProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    // Load active chat sessions
    const loadSessions = async () => {
      try {
        const token = getCookie('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-session/active`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSessions(data);
        updateUnreadCounts(data);
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    };

    loadSessions();

    // Set up real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);
    
    channel.bind('session.updated', (data: { session: ChatSession }) => {
      setSessions(prev => {
        const exists = prev.some(s => s.id === data.session.id);
        if (!exists) {
          return [...prev, data.session];
        }
        return prev.map(s => s.id === data.session.id ? data.session : s);
      });
    });

    channel.bind('message.new', (data: { message: Message }) => {
      setUnreadCounts(prev => ({
        ...prev,
        [data.message.chat_session_id]: (prev[data.message.chat_session_id] || 0) + 1
      }));
      if (onMessageRead) onMessageRead();
    });

    return () => {
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user, onMessageRead]);

  const updateUnreadCounts = async (sessions: ChatSession[]) => {
    const token = getCookie('token');
    const counts: Record<number, number> = {};
    for (const session of sessions) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-sessions/${session.id}/unread-count`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        counts[session.id] = data.count;
      } catch (error) {
        console.error(`Failed to fetch unread count for session ${session.id}:`, error);
      }
    }
    setUnreadCounts(counts);
  };

  const handleSessionClick = async (session: ChatSession) => {
    router.push(`/meditation/chat/${session.id}`);
    // Mark messages as read when opening the chat
    if (unreadCounts[session.id] > 0) {
      try {
        const token = getCookie('token');
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat-sessions/${session.id}/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setUnreadCounts(prev => ({ ...prev, [session.id]: 0 }));
        if (onMessageRead) onMessageRead();
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  return (
    <ScrollArea className="h-[calc(600px-64px)]">
      <div className="p-4 space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
            onClick={() => handleSessionClick(session)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{session.category?.name}</h4>
                {unreadCounts[session.id] > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCounts[session.id]} new
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}