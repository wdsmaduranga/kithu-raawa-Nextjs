'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MessageCircle, Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { acceptChatSession } from '@/lib/api';
import type { ChatSession, Message } from '@/lib/types';
import Pusher from 'pusher-js';

export function ReverendNotifications() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user?.isReverendFather) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    // const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    //   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    //   authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
    //   auth: {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   },
    // });
    
    const channel = pusher.subscribe(`reverend.${user.id}`);
    
    // New chat session request
    channel.bind('session.new', (data: { session: ChatSession }) => {
      toast('New Chat Request', {
        description: data.session.initial_message.substring(0, 50) + '...',
        duration: 10000,
        action: {
          label: 'Accept',
          onClick: async () => {
            try {
              await acceptChatSession(data.session.id);
              router.push(`/reverend/chat/${data.session.id}`);
            } catch (error) {
              console.error('Failed to accept session:', error);
              toast.error('Failed to accept chat request');
            }
          },
        },
        icon: <Bell className="h-4 w-4" />,
      });
    });

    // New message in active chat
    channel.bind('message.new', (data: { message: Message }) => {
      toast('New Message', {
        description: data.message.message.substring(0, 50) + '...',
        action: {
          label: 'Reply',
          onClick: () => router.push(`/reverend/chat/${data.message.chat_session_id}`),
        },
        icon: <MessageCircle className="h-4 w-4" />,
      });
    });
// In both ChatNotifications.tsx and ReverendNotifications.tsx, add this to the useEffect:
channel.bind('message.status', (data: { messageId: number, status: 'sent' | 'delivered' | 'seen' }) => {
  // if (data.status === 'seen') {
    toast('Message Seen', {
      description: 'Your message has been seen',
      icon: <CheckCheck className="h-4 w-4" />,
    });
  // }
});
    return () => {
      pusher.unsubscribe(`reverend.${user.id}`);
    };
  }, [user, router]);

  return null;
}