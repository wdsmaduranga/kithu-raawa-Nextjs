'use client'
import { Chat } from '@/components/meditation/Chat';
import { useUserStore } from '@/stores/user-store';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

export default function ChatPage() {
  const params = useParams(); // Unwrap params safely
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
        fetchUser(); // Fetch user details if not already loaded
    }
}, [user, fetchUser]);
useEffect(() => {
  if (params?.id) {
      const id = parseInt(params.id as string);
      if (!isNaN(id)) {
          setSessionId(id);
      } else {
          console.error("Invalid session ID");
          router.push("/error"); // Redirect if invalid
      }
  }
}, [params, router]);

if (!sessionId || !user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Spiritual Consultation</h1>
        <Chat sessionId={sessionId} userId={user?.id} />
      </div>
    </div>
  );
}
