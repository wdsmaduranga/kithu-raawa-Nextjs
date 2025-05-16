'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, MessageCircleMore, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatWindow } from './ChatWindow';
import { useUserStore } from '@/stores/userStore';
import Pusher from 'pusher-js';
import { getCookie } from 'cookies-next';

export function MessengerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useUserStore((state) => state.user);
  const token = getCookie("token");

  useEffect(() => {
    if (!user) return;

    // Initial unread count
    fetchUnreadCount();

    // Set up real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);
    
    channel.bind('message.new', () => {
      fetchUnreadCount();
    });

    return () => {
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/unread-count`,
        {
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[380px] h-[600px] mb-16">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Messages</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ChatWindow onMessageRead={fetchUnreadCount} />
        </div>
      ) : (
        <Button
          size="lg"
          className="rounded-full h-20 w-20 shadow-lg relative text-white px-4"  
          onClick={() => setIsOpen(true)}
        >
          <MessageCircleMore 
          //  size={48} 
           className='h-20 w-20'
            />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 px-2 py-1 bg-red-500"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}