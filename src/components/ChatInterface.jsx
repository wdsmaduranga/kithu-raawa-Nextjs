'use client'
// components/ChatInterface.js
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';

export default function ChatInterface({ chatSessionId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSession, setChatSession] = useState(null);
  const user = useAuth(); // Your auth hook

  useEffect(() => {
    // Fetch chat session details
    axios.get(`/api/chat-sessions/active`)
      .then(response => {
        setChatSession(response.data);
        setMessages(response.data.messages || []);
      });

    // Set up Pusher for real-time messages
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`chat.${chatSessionId}`);
    
    channel.bind('NewMessageSent', (data) => {
      setMessages(prevMessages => [...prevMessages, data.message]);
      
      // Mark message as read if it's for the current user
      if (data.message.receiver_id === user.id) {
        axios.post(`/api/messages/${data.message.id}/read`);
      }
    });

    return () => {
      pusher.unsubscribe(`chat.${chatSessionId}`);
    };
  }, [chatSessionId, user]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    axios.post('/api/messages', {
      chat_session_id: chatSessionId,
      message: newMessage
    })
      .then(response => {
        setMessages(prevMessages => [...prevMessages, response.data]);
        setNewMessage('');
      })
      .catch(error => {
        console.error("Error sending message", error);
      });
  };

  const closeChat = () => {
    axios.post(`/api/chat-sessions/${chatSessionId}/close`)
      .then(() => {
        // Redirect to dashboard or home
        router.push('/dashboard');
      });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {chatSession && (
          <>
            <h2>Chat with {user.role === 'reverend' ? chatSession.user.name : 'Reverend ' + chatSession.reverend.name}</h2>
            <p>Category: {chatSession.category.name}</p>
          </>
        )}
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.sender_id === user.id ? 'sent' : 'received'}`}
          >
            <p>{message.message}</p>
            <small>{new Date(message.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      
      <div className="message-input">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      
      <button onClick={closeChat} className="close-chat-btn">End Chat</button>
    </div>
  );
}