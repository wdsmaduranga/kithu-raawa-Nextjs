'use client'
import { Chat } from '@/components/meditation/Chat';
import { useUserStore } from '@/stores/user-store';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id as string);
      if (!isNaN(id)) {
        setSessionId(id);
      } else {
        console.error("Invalid session ID");
        router.push("/error");
      }
    }
  }, [params, router]);

  if (!sessionId || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Chat sessionId={sessionId} userId={user.id} />
      </div>
    </div>
  );
}
