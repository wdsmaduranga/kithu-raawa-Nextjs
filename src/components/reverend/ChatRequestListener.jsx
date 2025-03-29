// components/reverend/ChatRequestListener.js
'use client'
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
export default function ChatRequestListener() {
  const [pendingChats, setPendingChats] = useState([]);
  const user = useAuth(); // Your auth hook

  useEffect(() => {
    if (!user || user.role !== 'reverend') return;
    // Initial fetch of waiting chats
    axios.get('/api/chat-sessions/waiting')
      .then(response => {
        setPendingChats(response.data);
      });

    // Set up Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`consultant.${user.id}`);
    
    channel.bind('NewChatSessionCreated', (data) => {
      setPendingChats(prevChats => [...prevChats, data.chatSession]);

    });

    return () => {
      pusher.unsubscribe(`consultant.${user.id}`);
    };
  }, [user]);

  const acceptChat = (chatSessionId) => {
    axios.post(`/api/chat-sessions/${chatSessionId}/accept`)
      .then(() => {
        // Redirect to chat interface
        router.push(`/chat/${chatSessionId}`);
      })
      .catch(error => {
        console.error("Error accepting chat", error);
      });
  };

  return (
    <div>
      <h2>Pending Chat Requests</h2>
      {pendingChats.map(chat => (
        <div key={chat.id} className="chat-request-card">
          <h3>Category: {chat.category.name}</h3>
          <p>Initial message: {chat.initial_message}</p>
          <button onClick={() => acceptChat(chat.id)}>Accept Chat</button>
        </div>
      ))}
    </div>
  );
}