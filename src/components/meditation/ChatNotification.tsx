'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MessageCircle, Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import type { ChatSession, Message } from '@/lib/types';
import Pusher from 'pusher-js';

export function ChatNotifications() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);
    
    // For users: Show notification when reverend accepts chat
    channel.bind('session.updated', (data: { session: ChatSession }) => {
      if (data.session.status === 'active') {
        toast('Chat Request Accepted', {
          description: 'A Reverend Father has accepted your chat request',
          action: {
            label: 'View Chat',
            onClick: () => router.push(`/meditation/chat/${data.session.id}`),
          },
          icon: <Bell className="h-4 w-4" />,
        });
      }
    });

    // For both users and reverends: Show notification for new messages
    channel.bind('message.new', (data: { message: Message }) => {
      toast('New Message', {
        description: data.message.message.substring(0, 50) + '...',
        action: {
          label: 'Reply',
          onClick: () => router.push(`/meditation/chat/${data.message.chat_session_id}`),
        },
        icon: <MessageCircle className="h-4 w-4" />,
      });
    });
    
// In both ChatNotifications.tsx and ReverendNotifications.tsx, add this to the useEffect:
channel.bind('message.status', (data: { messageId: number, status: 'sent' | 'delivered' | 'seen' }) => {
  if (data.status === 'seen') {
    toast('Message Seen', {
      description: 'Your message has been seen',
      icon: <CheckCheck className="h-4 w-4" />,
    });
  }
});
    return () => {
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user, router]);

  return null;
}