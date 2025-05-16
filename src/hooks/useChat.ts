import { useState, useRef, useEffect } from 'react';
import Pusher from 'pusher-js';
import { Message } from '@/lib/types';
import { getMessages, markMessageAsDelivered, markMessageAsSeen, sendMessage } from '@/lib/api';

interface UseChatProps {
  sessionId: number;
  userId: number;
}

export function useChat({ sessionId, userId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const processedMessagesRef = useRef<{[key: number]: {delivered: boolean, seen: boolean}}>({});

  useEffect(() => {
    Pusher.logToConsole = false;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    const userChannel = pusher.subscribe(`user.${userId}`);
    
    userChannel.bind(`message.new`, (data: { message: Message }) => {
      setMessages((prev) => {
        if (!prev.some(m => m.id === data.message.id)) {
          if (data.message.receiver_id === userId) {
            if (!processedMessagesRef.current[data.message.id]) {
              processedMessagesRef.current[data.message.id] = { delivered: false, seen: false };
            }
            
            if (!processedMessagesRef.current[data.message.id].delivered) {
              processedMessagesRef.current[data.message.id].delivered = true;
              setTimeout(() => {
                markMessageAsDelivered(data.message.id)
                  .then(() => {
                    setMessages(prevMessages => 
                      prevMessages.map(msg => 
                        msg.id === data.message.id 
                          ? { ...msg, status: 'delivered', delivered_at: new Date().toISOString() } 
                          : msg
                      )
                    );
                    
                    if (!processedMessagesRef.current[data.message.id].seen) {
                      processedMessagesRef.current[data.message.id].seen = true;
                      setTimeout(() => {
                        markMessageAsSeen(data.message.id)
                          .then(() => {
                            setMessages(prevMessages => 
                              prevMessages.map(msg => 
                                msg.id === data.message.id 
                                  ? { ...msg, status: 'seen', seen_at: new Date().toISOString() } 
                                  : msg
                              )
                            );
                          })
                          .catch(() => {});
                      }, 1000);
                    }
                  })
                  .catch(() => {});
              }, 300);
            }
          }
          return [...prev, data.message];
        }
        return prev;
      });
    });
    
    userChannel.bind(`message.status`, (data: { messageId: number, status: 'sent' | 'delivered' | 'seen' }) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === data.messageId) {
            return { 
              ...msg, 
              status: data.status,
              delivered_at: data.status === 'delivered' || data.status === 'seen' 
                ? msg.delivered_at || new Date().toISOString() 
                : msg.delivered_at,
              seen_at: data.status === 'seen' 
                ? msg.seen_at || new Date().toISOString() 
                : msg.seen_at
            };
          }
          return msg;
        })
      );
    });

    getMessages(sessionId).then((data: Message[]) => {
      const processedMessages: {[key: number]: {delivered: boolean, seen: boolean}} = {};
      data.forEach(msg => {
        processedMessages[msg.id] = {
          delivered: !!msg.delivered_at,
          seen: !!msg.seen_at
        };
      });
      
      processedMessagesRef.current = processedMessages;
      setMessages(data);
      
      const unreadMessages = data.filter(msg => 
        msg.receiver_id === userId && !msg.seen_at
      );
      
      if (unreadMessages.length > 0) {
        const latestUnread = unreadMessages[unreadMessages.length - 1];
        
        if (!processedMessagesRef.current[latestUnread.id]?.delivered) {
          processedMessagesRef.current[latestUnread.id] = { 
            ...processedMessagesRef.current[latestUnread.id],
            delivered: true
          };
          
          setTimeout(() => {
            markMessageAsDelivered(latestUnread.id)
              .then(() => {
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === latestUnread.id 
                      ? { ...msg, status: 'delivered', delivered_at: new Date().toISOString() } 
                      : msg
                  )
                );
                
                if (!processedMessagesRef.current[latestUnread.id]?.seen) {
                  processedMessagesRef.current[latestUnread.id] = { 
                    ...processedMessagesRef.current[latestUnread.id],
                    seen: true
                  };
                  
                  setTimeout(() => {
                    markMessageAsSeen(latestUnread.id)
                      .then(() => {
                        setMessages(prevMessages => 
                          prevMessages.map(msg => 
                            msg.id === latestUnread.id 
                              ? { ...msg, status: 'seen', seen_at: new Date().toISOString() } 
                              : msg
                          )
                        );
                      })
                      .catch(() => {});
                  }, 1000);
                }
              })
              .catch(() => {});
          }, 300);
        }
      }
    });

    return () => {
      userChannel.unbind_all();
      pusher.unsubscribe(`user.${userId}`);
    };
  }, [sessionId, userId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const tempMessage: Message = {
        id: Date.now(),
        chat_session_id: sessionId,
        sender_id: userId,
        receiver_id: messages.find(m => m.sender_id !== userId)?.sender_id || 0,
        message: newMessage,
        status: 'sent',
        delivered_at: null,
        seen_at: null,
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      const sentMessage = await sendMessage(sessionId, newMessage);
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? { ...sentMessage, status: 'sent' } : msg
        )
      );
    } catch (error) {
      // Handle error silently
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isTyping,
    setIsTyping,
    handleSend
  };
} 