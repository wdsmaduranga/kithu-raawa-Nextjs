import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, CheckCheck } from "lucide-react"
import { format } from "date-fns"
import { Message } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { RefObject } from "react"

interface ChatMessageListProps {
  messages: Message[];
  userId: number;
  isTyping: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  bottomRef: RefObject<HTMLDivElement>;
}

export function ChatMessageList({ messages, userId, isTyping, scrollRef, bottomRef }: ChatMessageListProps) {
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a")
  }

  const renderMessageStatus = (message: Message) => {
    if (message.sender_id !== userId) return null;
    
    if (message.status === 'seen' || message.seen_at) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else if (message.status === 'delivered' || message.delivered_at) {
      return <CheckCheck className="h-4 w-4 text-gray-500" />;
    } else {
      return <Check className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-gradient-to-b from-muted/50 to-background">
      <div className="space-y-4">
        {/* Session start indicator */}
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
            Session started {format(new Date(messages[0]?.created_at || new Date()), "MMMM d, yyyy")}
          </Badge>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender_id === userId ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className={`h-8 w-8 ${message.sender_id === userId ? "opacity-0" : ""}`}>
                <AvatarImage src={message.sender_id === userId ? undefined : message.sender?.avatar_url} />
                <AvatarFallback className={message.sender_id !== userId ? "bg-primary/10 text-primary" : ""}>
                  {message.sender_id === userId ? "You" : message.sender?.first_name?.charAt(0) || "RF"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div
                  className={`rounded-lg p-3 ${
                    message.sender_id === userId
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
                <div
                  className={`flex mt-1 text-xs text-muted-foreground ${message.sender_id === userId ? "justify-end" : ""}`}
                >
                  <span>{formatMessageTime(message.created_at)}</span>
                  {message.sender_id === userId && <span className="ml-1">{renderMessageStatus(message)}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/10 text-primary">RF</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="rounded-lg p-3 bg-muted rounded-tl-none">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex mt-1 text-xs text-muted-foreground">
                    <span>Typing...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
} 