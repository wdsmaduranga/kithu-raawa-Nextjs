'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Message } from '@/lib/types';
import { useUserStore } from '@/stores/user-store';
import Pusher from 'pusher-js';

export function ChatNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message?: Message;
    sessionId?: number;
  } | null>(null);
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);
    
    // Listen for new messages
    channel.bind('message.new', (data: { message: Message }) => {
      setNotification({ message: data.message });
      setIsOpen(true);
    });

    // Listen for session updates
    channel.bind('session.updated', (data: { session: { id: number, status: string } }) => {
      if (data.session.status === 'active') {
        setNotification({ sessionId: data.session.id });
        setIsOpen(true);
      }
    });

    return () => {
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user]);

  const handleViewChat = () => {
    if (notification?.sessionId) {
      router.push(`/meditation/chat/${notification.sessionId}`);
    }
    setIsOpen(false);
    setNotification(null);
  };

  if (!notification || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {notification.message ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {notification.message.message}
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A Reverend Father has accepted your chat request!
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button onClick={handleViewChat}>
            <MessageCircle className="w-4 h-4 mr-2" />
            View Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}