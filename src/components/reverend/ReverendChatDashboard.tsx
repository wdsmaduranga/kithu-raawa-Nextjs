'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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

interface ReverendChatDashboardProps {
  sessionId: number;
  onSessionChange?: (sessionId: number) => void;
}

const quickResponses = {
  Greetings: [
    "Peace be with you! How may I assist you today?",
    "Greetings in Christ! How can I help you?",
    "Welcome! I'm here to provide spiritual guidance.",
    "God bless you! How may I be of service?",
  ],
  Prayers: [
    "Let us pray together for your intention.",
    "I will keep you in my prayers.",
    "May God's grace be with you during this time.",
    "Let's ask for God's guidance in this matter.",
  ],
  Encouragement: [
    "Remember, God's love is unconditional and ever-present.",
    "Trust in the Lord's plan for your life.",
    "You're not alone in this journey.",
    "God's mercy is new every morning.",
  ],
  Blessings: [
    "May God bless you and keep you.",
    "May the peace of Christ be with you.",
    "May the Holy Spirit guide and protect you.",
    "God's grace be with you always.",
  ],
}

export function ReverendChatDashboard({ sessionId, onSessionChange }: ReverendChatDashboardProps) {
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
  const [activeTab, setActiveTab] = useState<string>("waiting")
  const { user } = useUserStore();

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processedMessagesRef = useRef<{[key: number]: {delivered: boolean, seen: boolean}}>({})

  // Function to load session data
  const loadSession = async (sessionId: number) => {
    setIsLoading(true);
    try {
      const sessionData = await getChatSession(sessionId);
      setSession(sessionData);

      // Load messages and track their status
      const messages = await getMessages(sessionId);
      
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
      const unreadMessages = messages.filter((msg: Message) => 
        msg.receiver_id === sessionData.reverend_id && !msg.seen_at
      );
      
      // Process only the most recent unread message
      if (unreadMessages.length > 0) {
        const latestUnread = unreadMessages[unreadMessages.length - 1];
        if (!processedMessagesRef.current[latestUnread.id]?.delivered) {
          await markMessageAsDelivered(latestUnread.id);
          await markMessageAsSeen(latestUnread.id);
        }
      }

      // Update active tab based on session status
      setActiveTab(sessionData.status);
    } catch (error) {
      console.error("Failed to load session:", error);
      toast({
        variant: "destructive",
        title: "Error loading session",
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session click
  const handleSessionClick = async (s: ChatSession) => {
    if (onSessionChange) {
      onSessionChange(s.id);
    } else {
      // Update URL without page reload if no handler provided
      router.push(`/reverend/chat/${s.id}`, { scroll: false });
    }
    // Load the new session data
    await loadSession(s.id);
  };

  useEffect(() => {
    if (!sessionId) return;
    
    loadSession(sessionId);

    // Set up Pusher for real-time updates
    Pusher.logToConsole = false;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user?.id}`);
    
    // Listen for new messages
    channel.bind(`message.new.${sessionId}`, (data: { message: Message }) => {
      setMessages((prev) => {
        if (!prev.some(m => m.id === data.message.id)) {
          if (data.message.receiver_id === session?.reverend_id) {
            if (!processedMessagesRef.current[data.message.id]) {
              processedMessagesRef.current[data.message.id] = { delivered: false, seen: false };
            }
            if (!processedMessagesRef.current[data.message.id].delivered) {
              markMessageAsDelivered(data.message.id)
                .then(() => markMessageAsSeen(data.message.id));
            }
          }
          return [...prev, data.message];
        }
        return prev;
      });
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    // Listen for session updates
    channel.bind('session.updated', (data: { session: ChatSession }) => {
      if (data.session.id === sessionId) {
        setSession(data.session);
      }
      // Update session in sidebar list
      setAllSessions(prev => 
        prev.map(s => s.id === data.session.id ? data.session : s)
      );
    });

    return () => {
      pusher.unsubscribe(`user.${user?.id}`);
    };
  }, [sessionId, user?.id]);

  // Load all sessions for sidebar
  useEffect(() => {
    const loadAllSessions = async () => {
      try {
        const sessions = await getChatSessions();
        setAllSessions(sessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadAllSessions();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCloseSession = async () => {
    if (!session) return;

    try {
      await closeChatSession(session.id);
      toast({
        title: "Session closed",
        description: "The chat session has been successfully closed.",
      });
      router.push("/reverend");
    } catch (error) {
      console.error("Failed to close session:", error);
      toast({
        variant: "destructive",
        title: "Failed to close session",
        description: "Please try again or contact support if the problem persists.",
      });
    }
  };

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
        sender_id: session.reverend_id!,
        receiver_id: session.user_id,
        message: newMessage,
        status: 'sent',
        delivered_at: null,
        seen_at: null,
        read_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin mb-4 mx-auto">
            <Cross className="h-8 w-8 text-primary/70" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Chat Session</h2>
          <p className="text-muted-foreground">Please wait while we retrieve the conversation...</p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The chat session you're looking for doesn't exist or has been closed.
          </p>
          <Button onClick={() => router.push("/reverend")}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
        {/* Sidebar - Message Lists */}
        <div className={`${sidebarOpen ? "block" : "hidden"} md:block border-r bg-background w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Messages</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/reverend")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start px-4 pt-2">
              <TabsTrigger value="waiting" className="flex-1">
                Waiting
                <Badge variant="secondary" className="ml-2">
                  {allSessions.filter((s) => s.status === "waiting").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active
                <Badge variant="secondary" className="ml-2">
                  {allSessions.filter((s) => s.status === "active").length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {["waiting", "active"].map((status) => (
              <TabsContent key={status} value={status} className="m-0 p-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-1 p-2">
                    {allSessions
                      .filter((s) => s.status === status)
                      .map((s) => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            s.id === session?.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleSessionClick(s)}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={s.user?.avatar_url} />
                              <AvatarFallback>{s.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm truncate">{s.user?.first_name || "Anonymous"}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(s.created_at), "h:mm a")}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="px-1 text-xs">
                                  {s.category?.name || "General"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{s.initial_message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user?.avatar_url} />
                  <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{session.user?.first_name || "Anonymous"}</h3>
                    <Badge variant="outline" className="text-xs">
                      {session.category?.name || "General"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session.status === "active" ? "Active now" : "Waiting for response"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
                      <Info className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Session Info</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCloseSession} className="text-destructive">
                    Close Session
                  </DropdownMenuItem>
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
                  Session started {format(new Date(session.created_at), "MMMM d, yyyy")}
                </Badge>
              </div>

              {/* Initial message */}
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.avatar_url} />
                    <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="rounded-lg p-3 bg-muted rounded-tl-none">
                      <p className="text-sm">{session.initial_message}</p>
                    </div>
                    <div className="flex mt-1 text-xs text-muted-foreground">
                      <span>{format(new Date(session.created_at), "h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_id === session.reverend_id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender_id === session.reverend_id ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className={`h-8 w-8 ${message.sender_id === session.reverend_id ? "opacity-0" : ""}`}>
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback>
                        {message.sender_id === session.reverend_id ? "R" : message.sender?.first_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender_id === session.reverend_id
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                      <div
                        className={`flex mt-1 text-xs text-muted-foreground ${
                          message.sender_id === session.reverend_id ? "justify-end" : ""
                        }`}
                      >
                        <span>{format(new Date(message.created_at), "h:mm a")}</span>
                        {message.sender_id === session.reverend_id && (
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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Dialog open={showQuickResponses} onOpenChange={setShowQuickResponses}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="outline">
                      <FileText className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Quick Responses</DialogTitle>
                      <DialogDescription>
                        Select a category and choose a response to send.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs
                      defaultValue={selectedQuickResponseCategory}
                      onValueChange={setSelectedQuickResponseCategory}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-4">
                        {Object.keys(quickResponses).map((category) => (
                          <TabsTrigger key={category} value={category} className="text-xs">
                            {category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {Object.entries(quickResponses).map(([category, responses]) => (
                        <TabsContent key={category} value={category} className="mt-4">
                          <div className="space-y-2">
                            {responses.map((response, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start text-left h-auto whitespace-normal"
                                onClick={() => handleQuickResponse(response)}
                              >
                                {response}
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button size="icon" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                  <Send className={`h-5 w-5 ${isSending ? "animate-pulse" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="hidden lg:block border-l bg-background w-80 flex-shrink-0 h-full overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Session Information</h3>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">User Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{session.user?.first_name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {format(new Date(session.user?.created_at || session.created_at), "MMMM yyyy")}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Session Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Started {format(new Date(session.created_at), "PPp")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{messages.length} messages</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(session.category?.name)}
                  <span className="text-sm">{session.category?.name || "General"}</span>
                </div>
              </div>

              <Button variant="destructive" className="w-full" onClick={handleCloseSession}>
                Close Session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 