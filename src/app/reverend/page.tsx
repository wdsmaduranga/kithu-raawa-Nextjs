'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Clock, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatSession } from '@/lib/types';
import { getChatSessions, acceptChatSession } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import { useUserStore } from '@/stores/userStore';

export default function ReverendDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  Pusher.logToConsole = true;
  const router = useRouter();
  const user = useUserStore((state) => state.user);


  useEffect(() => {
    if (!user) return;
    const loadSessions = async () => {
      const data = await getChatSessions();
      setSessions(data);
    };
    loadSessions();
    // Set up real-time updates for new sessions
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`user.${user?.id}`);
      channel.bind('session.updated',(data: { session: ChatSession }) => {
      setSessions((prev) => [data.session, ...prev]);
    });

    return () => {
      pusher.unsubscribe(`user.${user?.id}`);
    };
  }, [user ]);

  const handleAccept = async (sessionId: number) => {
    try {
      await acceptChatSession(sessionId);
      router.push(`/reverend/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to accept session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" /> Waiting</Badge>;
      case 'active':
        return <Badge variant="default"><MessageCircle className="w-4 h-4 mr-1" /> Active</Badge>;
      case 'closed':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Closed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reverend Dashboard</h1>
      
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="waiting">Waiting</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {['waiting', 'active', 'closed'].map((status) => (
          <TabsContent key={status} value={status}>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {sessions
                  .filter(session => session.status === status)
                  .map(session => (
                    <Card key={session.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{session.category?.name}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm mb-4">{session.initial_message}</p>
                      {session.status === 'waiting' && (
                        <Button onClick={() => handleAccept(session.id)}>
                          Accept Request
                        </Button>
                      )}
                      {session.status === 'active' && (
                        <Button onClick={() => router.push(`/reverend/chat/${session.id}`)}>
                          Continue Chat
                        </Button>
                      )}
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}