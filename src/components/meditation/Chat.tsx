"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { AnimatePresence } from "framer-motion"
import { useChat } from "@/hooks/useChat"
import { ChatHeader } from "./ChatHeader"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"
import { ChatInfoPanel } from "./ChatInfoPanel"
import { useState } from "react"
import { ChatSession } from "@/lib/types"
import { getChatSession } from "@/lib/api"

interface ChatProps {
  sessionId: number;
  userId: number;
}

export function Chat({ sessionId, userId }: ChatProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    newMessage,
    setNewMessage,
    isTyping,
    handleSend
  } = useChat({ sessionId, userId });

  useEffect(() => {
    getChatSession(sessionId).then(setSession);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-pulse text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;

  return (
    <div className="relative">
      <Card className="flex flex-col h-[600px] shadow-lg border-t-4 border-t-primary">
        <ChatHeader 
          session={session}
          latestMessage={latestMessage}
          onInfoClick={() => setShowInfo(!showInfo)} 
          showBackButton 
        />
        
        <ChatMessageList
          messages={messages}
          userId={userId}
          isTyping={isTyping}
          scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
          bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
        />

        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSend}
          inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
          disabled={session.status !== 'active'}
        />
      </Card>

      <AnimatePresence>
        {showInfo && (
          <ChatInfoPanel
            onClose={() => setShowInfo(false)}
            session={session}
            messages={messages}
          />
        )}
      </AnimatePresence>
    </div>
  );
}