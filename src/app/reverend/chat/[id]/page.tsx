'use client';

import { useEffect, useState } from 'react';
import { Chat } from '@/components/meditation/Chat';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getChatSession, closeChatSession } from '@/lib/api';
import type { ChatSession } from '@/lib/types';
import { useParams, useRouter } from "next/navigation";

export default function ReverendChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const router = useRouter();
  const params = useParams(); // ✅ Correct way to access params


  useEffect(() => {
    const loadSession = async () => {
      if (params?.id) {
        const sessionId = parseInt(params.id as string); // Convert to number safely
        if (!isNaN(sessionId)) {
          const data = await getChatSession(sessionId);
          setSession(data);
        } else {
          console.error("Invalid session ID");
          router.push("/reverend"); // Redirect on invalid ID
        }
      }
    };
    loadSession();
  }, [params, router]);
  const handleClose = async () => {
    if (!session) return;
    try {
      await closeChatSession(session.id);
      router.push('/reverend');
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  if (!session) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/reverend')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          {session.status === 'active' && (
            <Button variant="destructive" onClick={handleClose}>
              Close Session
            </Button>
          )}
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{session.category?.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Initial message: {session.initial_message}
          </p>
        </div>

        <Chat sessionId={session.id} userId={session.reverend_id!} />
      </div>
    </div>
  );
}