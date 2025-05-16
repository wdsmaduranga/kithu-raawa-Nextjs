"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Info,
  Phone,
  Video,
  MoreVertical,
  User,
  Clock,
  Calendar,
  CheckCheck,
  Check,
  XCircle,
  HandIcon as PrayingHands,
  Cross,
  FileText,
  Heart,
  BookOpen,
  MessageCircle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

import type { ChatSession, Message } from "@/lib/types"
import { 
  getChatSession, 
  sendMessage, 
  closeChatSession, 
  getChatSessions, 
  getMessages,
  markMessageAsDelivered,
  markMessageAsSeen 
} from "@/lib/api"
import Pusher from "pusher-js"
import { useUserStore } from "@/stores/user-store"

// Quick responses data
const quickResponses = [
  {
    id: 1,
    category: "Greetings",
    responses: [
      "Peace be with you. How may I assist you in your spiritual journey today?",
      "Greetings in Christ. I'm here to provide guidance and support.",
      "Welcome. I'm here to listen and offer spiritual guidance. How can I help you today?",
    ],
  },
  {
    id: 2,
    category: "Scripture",
    responses: [
      'This reminds me of a passage from Scripture: "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11',
      'As Saint Paul writes in Philippians 4:13, "I can do all things through Christ who strengthens me."',
      'Jesus teaches us in Matthew 11:28, "Come to me, all you who are weary and burdened, and I will give you rest."',
    ],
  },
  {
    id: 3,
    category: "Prayer",
    responses: [
      "Let us pray together about this situation. Would you like me to offer a prayer for you?",
      "I'll keep you in my prayers. Remember that God is always listening, even when it feels like He's silent.",
      "Prayer is a powerful tool in times like these. Would you like to join me in a moment of prayer for your situation?",
    ],
  },
  {
    id: 4,
    category: "Comfort",
    responses: [
      "Remember that God's love for you is unchanging, even in difficult times.",
      "It's normal to have these feelings. Faith doesn't mean we never struggle, but that we're never alone in our struggles.",
      "The Church is your spiritual family, and we're here to support you through this journey.",
    ],
  },
]
interface ChatProps {
  sessionId: number;
  userId: number;
}

export default function ChatDashboard({ sessionId, userId }: ChatProps) {
const params = useParams()
const router = useRouter()
const { toast } = useToast()
const [session, setSession] = useState<ChatSession | null>(null)
const [messages, setMessages] = useState<Message[]>([])
const [newMessage, setNewMessage] = useState("")
const [isLoading, setIsLoading] = useState(true)
const [isSending, setIsSending] = useState(false)
const [showInfo, setShowInfo] = useState(false)
const [showQuickResponses, setShowQuickResponses] = useState(false)
const [selectedQuickResponseCategory, setSelectedQuickResponseCategory] = useState("Greetings")
const [sidebarOpen, setSidebarOpen] = useState(true)
const [allSessions, setAllSessions] = useState<ChatSession[]>([])
const [isTyping, setIsTyping] = useState(false)
const { user, fetchUser } = useUserStore();

const messagesEndRef = useRef<HTMLDivElement>(null)
const textareaRef = useRef<HTMLTextAreaElement>(null)
const processedMessagesRef = useRef<{[key: number]: {delivered: boolean, seen: boolean}}>({})

useEffect(() => {
  if (!sessionId) {
    router.push("/reverend")
    return
  }

  const loadSession = async () => {
    setIsLoading(true)
    try {
      const sessionData = await getChatSession(sessionId)
      setSession(sessionData)

      // Load messages and track their status
      const messages = await getMessages(sessionId)
      
      // Mark initial status for all loaded messages
      const processedMessages: {[key: number]: {delivered: boolean, seen: boolean}} = {};
      messages.forEach((msg: { id: number; delivered_at: any; seen_at: any }) => {
        processedMessages[msg.id] = {
          delivered: !!msg.delivered_at,
          seen: !!msg.seen_at
        };
      });
      
      // Store processed state
      processedMessagesRef.current = processedMessages;
      
      // Set messages in state
      setMessages(messages);

      // Find unread messages sent to the current user
      const unreadMessages = messages.filter((msg: { receiver_id: any; seen_at: any }) => 
        msg.receiver_id === sessionData.reverend_id && !msg.seen_at
      );
      
      // Process only the most recent unread message
      if (unreadMessages.length > 0) {
        const latestUnread = unreadMessages[unreadMessages.length - 1];
        
        // Mark as delivered first
        if (!processedMessagesRef.current[latestUnread.id]?.delivered) {
          processedMessagesRef.current[latestUnread.id] = { 
            ...processedMessagesRef.current[latestUnread.id],
            delivered: true
          };
          
          setTimeout(() => {
            markMessageAsDelivered(latestUnread.id)
              .then(() => {
                // Update in state
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.id === latestUnread.id 
                      ? { ...msg, status: 'delivered', delivered_at: new Date().toISOString() } 
                      : msg
                  )
                );
                
                // Then mark as seen
                if (!processedMessagesRef.current[latestUnread.id]?.seen) {
                  processedMessagesRef.current[latestUnread.id] = { 
                    ...processedMessagesRef.current[latestUnread.id],
                    seen: true
                  };
                  
                  setTimeout(() => {
                    markMessageAsSeen(latestUnread.id)
                      .then(() => {
                        // Update in state
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

      // Load all sessions for the sidebar
      const sessions = await getChatSessions();
      setAllSessions(sessions)
    } catch (error) {
      console.error("Failed to load session:", error)
      toast({
        variant: "destructive",
        title: "Error loading session",
        description: "Please try again or contact support if the problem persists.",
      })
      router.push("/reverend")
    } finally {
      setIsLoading(false)
    }
  }

  loadSession()

  // Set up Pusher for real-time updates
  Pusher.logToConsole = false
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  })

  const channel = pusher.subscribe(`user.${user?.id}`)
  
  // Listen for new messages
  channel.bind(`message.new`, (data: { message: Message }) => {
    setMessages((prev) => {
      // Avoid duplicates by checking if message already exists
      if (!prev.some(m => m.id === data.message.id)) {
        // If this is a message for the current user, mark it as delivered/seen
        if (data.message.receiver_id === session?.reverend_id) {
          // Initialize tracking for this message if needed
          if (!processedMessagesRef.current[data.message.id]) {
            processedMessagesRef.current[data.message.id] = { delivered: false, seen: false };
          }
          
          // Mark as delivered if not already done
          if (!processedMessagesRef.current[data.message.id].delivered) {
            processedMessagesRef.current[data.message.id].delivered = true;
            setTimeout(() => {
              markMessageAsDelivered(data.message.id)
                .then(() => {
                  // Update the message in state to show delivered status
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === data.message.id 
                        ? { ...msg, status: 'delivered', delivered_at: new Date().toISOString() } 
                        : msg
                    )
                  );
                  
                  // After marking as delivered, mark as seen with a delay
                  if (!processedMessagesRef.current[data.message.id].seen) {
                    processedMessagesRef.current[data.message.id].seen = true;
                    setTimeout(() => {
                      markMessageAsSeen(data.message.id)
                        .then(() => {
                          // Update the message in state to show seen status
                          setMessages(prevMessages => 
                            prevMessages.map(msg => 
                              msg.id === data.message.id 
                                ? { ...msg, status: 'seen', seen_at: new Date().toISOString() } 
                                : msg
                            )
                          );
                        })
                        .catch(() => {});
                    }, 500);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Listen for message status updates
  channel.bind(`message.status`, (data: { messageId: number, status: 'sent' | 'delivered' | 'seen' }) => {
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

  // Listen for session updates
  channel.bind('session.updated', (data: { session: ChatSession }) => {
    if (data.session.id === sessionId) {
      setSession(data.session)
    }
    // Update session in sidebar list
    setAllSessions(prev => 
      prev.map(s => s.id === data.session.id ? data.session : s)
    )
  })

  return () => {
    pusher.unsubscribe(`user.${session?.user_id}`)
  }
}, [params, router, user , toast, session?.user_id, session?.id, session?.reverend_id])

useEffect(() => {
  // Scroll to bottom when messages change
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])
  const handleCloseSession = async () => {
    if (!session) return

    try {
      await closeChatSession(session.id)

      toast({
        title: "Session closed",
        description: "The chat session has been successfully closed.",
      })

      router.push("/reverend")
    } catch (error) {
      console.error("Failed to close session:", error)
      toast({
        variant: "destructive",
        title: "Failed to close session",
        description: "Please try again or contact support if the problem persists.",
      })
    }
  }

  const handleQuickResponse = (response: string) => {
    setNewMessage(response)
    setShowQuickResponses(false)
    textareaRef.current?.focus()
  }

  const getCategoryIcon = (categoryName?: string) => {
    switch (categoryName) {
      case "Personal Spiritual Guidance":
        return <User className="h-5 w-5" />
      case "Prayer Requests":
        return <PrayingHands className="h-5 w-5" />
      case "Scripture Reflection":
        return <BookOpen className="h-5 w-5" />
      case "Confession Preparation":
        return <Heart className="h-5 w-5" />
      default:
        return <Cross className="h-5 w-5" />
    }
  }

const handleSendMessage = async () => {
  if (!newMessage.trim() || !session) return

  setIsSending(true)
  try {
    // Add a temporary message with "sending" status
    const tempMessage: Message = {
      id: Date.now(),
      chat_session_id: session.id,
      sender_id: userId!,
      receiver_id: session.user_id,
      message: newMessage,
      status: 'sent',
      delivered_at: null,
      seen_at: null,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // content: undefined
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage("")
    textareaRef.current?.focus()

    // Send the actual message to the server
    const sentMessage = await sendMessage(session.id, newMessage)

    // Replace the temporary message with the actual one from the server
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempMessage.id ? { ...sentMessage, status: 'sent' } : msg
      )
    )

    toast({
      title: 'Message sent',
      description: 'Your message has been delivered.',
    })
  } catch (error) {
    console.error("Failed to send message:", error)
    toast({
      variant: "destructive",
      title: "Failed to send message",
      description: "Please try again.",
    })

    // Remove the optimistic message
    setMessages(prev => prev.filter(msg => msg.id !== Date.now()))
  } finally {
    setIsSending(false)
  }
}
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Avatar>
                {/* <AvatarImage src={session.user?.avatar_url} /> */}
                {/* <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback> */}
              </Avatar>
              {/* <div>
                <h3 className="font-semibold">{session.user?.first_name || "Anonymous User"}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2 text-xs">
                    {session.category?.name || "General"}
                  </Badge>
                  <span>Started {format(new Date(session.created_at), "MMM d, h:mm a")}</span>
                </div>
              </div> */}
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Phone className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <Video className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Video Call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Session Information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    View Transcript
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PrayingHands className="h-4 w-4 mr-2" />
                    Send Prayer
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Share Scripture
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Session
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Close Session</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to close this session? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleCloseSession}>
                          Close Session
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Session start indicator */}
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                  {/* Session started {format(new Date(session.created_at), "MMMM d, yyyy")} */}
                </Badge>
              </div>

              {/* Initial message */}
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    {/* <AvatarImage src={session.user?.avatar_url} /> */}
                    {/* <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback> */}
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="rounded-lg p-3 bg-muted rounded-tl-none">
                      {/* <p className="text-sm">{session.initial_message}</p> */}
                    </div>
                    <div className="flex mt-1 text-xs text-muted-foreground">
                      {/* <span>{format(new Date(session.created_at), "h:mm a")}</span> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender_id === userId ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${message.sender_id === userId ? "opacity-0" : ""}`}>
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback>
                        {message.sender_id === userId ? "R" : message.sender?.first_name?.charAt(0) || "U"}
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
                        className={`flex mt-1 text-xs text-muted-foreground ${
                          message.sender_id === userId ? "justify-end" : ""
                        }`}
                      >
                        <span>{format(new Date(message.created_at), "h:mm a")}</span>
                        {message.sender_id === userId && (
                          <span className="ml-1">
                            {message.status === "seen" ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : message.status === "delivered" ? (
                              <CheckCheck className="h-3 w-3 text-gray-500" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[100px] pr-24 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <Dialog open={showQuickResponses} onOpenChange={setShowQuickResponses}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Quick Responses</DialogTitle>
                      <DialogDescription>Select a pre-written response to quickly reply to the user.</DialogDescription>
                    </DialogHeader>
                    <Tabs
                      value={selectedQuickResponseCategory}
                      onValueChange={setSelectedQuickResponseCategory}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-4 mb-4">
                        {quickResponses.map((category) => (
                          <TabsTrigger key={category.id} value={category.category}>
                            {category.category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {quickResponses.map((category) => (
                        <TabsContent key={category.id} value={category.category} className="mt-0">
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {category.responses.map((response, index) => (
                                <Card
                                  key={index}
                                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => handleQuickResponse(response)}
                                >
                                  <p className="text-sm">{response}</p>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                  className="rounded-full px-4"
                >
                  {isSending ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" /> Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="hidden lg:block border-l bg-background w-80 flex-shrink-0 h-full overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Session Information</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-6">
              <div className="flex flex-col items-center space-y-3 pb-4 border-b">
                {/* <div className="p-3 rounded-full bg-primary/10">{getCategoryIcon(session.category?.name)}</div> */}
                <div className="text-center">
                  {/* <h4 className="font-semibold">{session.category?.name || "General Guidance"}</h4> */}
                  <Badge variant="outline" className="mt-1">
                    {/* {session.status.charAt(0).toUpperCase() + session.status.slice(1)} */}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">User Information</h4>
                <div className="flex items-center gap-3">
                  <Avatar>
                    {/* <AvatarImage src={session.user?.avatar_url} /> */}
                    {/* <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback> */}
                  </Avatar>
                  <div>
                    {/* <p className="font-medium">{session.user?.first_name || "Anonymous User"}</p> */}
                    {/* <p className="text-xs text-muted-foreground">User ID: {session.user_id}</p> */}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Session Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {/* <span>Created: {format(new Date(session.created_at), "MMMM d, yyyy")}</span> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {/* <span>Time: {format(new Date(session.created_at), "h:mm a")}</span> */}
                  </div>
                  {/* {session.accepted_at && ( */}
                    {/* <div className="flex items-center gap-2"> */}
                      {/* <CheckCheck className="h-4 w-4 text-muted-foreground" /> */}
                      {/* <span>Accepted: {format(new Date(session.accepted_at), "MMMM d, h:mm a")}</span> */}
                    {/* </div> */}
                  {/* )} */}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Transcript
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <PrayingHands className="h-4 w-4 mr-2" />
                    Send Prayer
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Share Scripture
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Close Session</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to close this session? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleCloseSession}>
                          Close Session
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        )}
}