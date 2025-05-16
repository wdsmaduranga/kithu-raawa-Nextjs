"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Video,
  Info,
  MoreVertical,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ReverendChatArea } from "@/components/chat/ReverendChatArea"
import { ReverendInfoPanel } from "@/components/chat/ReverendInfoPanel"
import { useUserStore } from "@/stores/userStore"
import type { ChatSession, Message } from "@/lib/types"
import { getChatSessions, sendMessage, closeChatSession, markMessageAsDelivered, markMessageAsSeen, getMessages, unreadCount } from "@/lib/api"
import Pusher from "pusher-js"
import { VoiceCall } from "@/components/meditation/VoiceCall"

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

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const { user, fetchUser } = useUserStore()
  const [unreadCounts, setUnreadCounts] = useState<{[key: number]: number}>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processedMessagesRef = useRef<{[key: number]: {delivered: boolean, seen: boolean}}>({})

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser])

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const sessions = await getChatSessions();
        setAllSessions(sessions);
        
        // Only load session from URL params on initial load
        const sessionId = searchParams.get("id");
        if (sessionId && !session) {
          const selectedSession = sessions.find(
            (s: { id: number }) => s.id === parseInt(sessionId)
          );
          if (selectedSession) {
            await handleSessionSelect(selectedSession);
          }
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
        toast({
          variant: "destructive",
          title: "Error loading sessions",
          description: "Please try again or contact support if the problem persists.",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    if (user) {
      loadSessions();
    }
  }, [user, searchParams]); // Remove session from dependencies to avoid loops
  
  // Separate useEffect for Pusher subscription
  useEffect(() => {
    Pusher.logToConsole = false;
    if (!user || !session) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  
    const channel = pusher.subscribe(`user.${user.id}`);
  
    // Listen for new messages
    channel.bind(`message.new`, async (data: { message: Message }) => {
      // Check if message belongs to current session
      if (data.message.chat_session_id === session?.id) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
  
          // If message is for current user, mark as delivered/seen
          if (data.message.receiver_id === user.id) {
            // Use a single timeout for both delivered and seen status
            setTimeout(async () => {
              try {
                await markMessageAsDelivered(data.message.id);
                await markMessageAsSeen(data.message.id);
                
                // Update message status in a single state update
                setMessages(prevMessages =>
                  prevMessages.map(msg =>
                    msg.id === data.message.id
                      ? {
                          ...msg,
                          status: 'seen',
                          delivered_at: new Date().toISOString(),
                          seen_at: new Date().toISOString()
                        }
                      : msg
                  )
                );
              } catch (error) {
                console.error("Failed to update message status:", error);
              }
            }, 500);
          }
  
          return [...prev, data.message];
        });
  
        // Debounce scroll to bottom
        const scrollTimeout = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
  
        return () => clearTimeout(scrollTimeout);
      } else {
        await markMessageAsDelivered(data.message.id);
      }
    });
  
    // Listen for message status updates
    channel.bind(`message.status`, (data: {
      seen_at: string | null;
      delivered_at: string | null;
      messageId: number;
      status: "sent" | "delivered" | "seen";
      chat_session_id: number;
    }) => {
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg.id === data.messageId);
        if (!messageExists) return prevMessages;
  
        return prevMessages.map(msg =>
          msg.id === data.messageId
            ? {
                ...msg,
                status: data.status,
                delivered_at: data.delivered_at || msg.delivered_at,
                seen_at: data.seen_at || msg.seen_at,
              }
            : msg
        );
      });
    });
  
    // Listen for session updates
    channel.bind("session.updated", (data: { session: ChatSession }) => {
      if (data.session.id === session?.id) {
        setSession(data.session);
      }
      
      // Move updated session to top of the list
      setAllSessions(prev => {
        const sessionIndex = prev.findIndex(s => s.id === data.session.id);
        if (sessionIndex === -1) return prev;

        // Remove session from current position and add to top
        return [
          data.session,
          ...prev.slice(0, sessionIndex),
          ...prev.slice(sessionIndex + 1)
        ];
      });
    });
  
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user?.id, session?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return

    setIsSending(true)
    try {
      const response = await sendMessage(session.id, newMessage)
      setMessages(prev => [...prev, response])
      setNewMessage("")
      textareaRef.current?.focus()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleCloseSession = async () => {
    if (!session) return;

    try {
      setIsLoading(true); // Start loading
      await closeChatSession(session.id);
      
      toast({
        title: "Session closed",
        description: "The chat session has been successfully closed.",
      });

      // Clear current session data
      setSession(null);
      setMessages([]);
      router.push("/reverend");
    } catch (error) {
      console.error("Failed to close session:", error);
      toast({
        variant: "destructive",
        title: "Failed to close session",
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsLoading(false); // End loading regardless of outcome
    }
  }

  const handleQuickResponse = (response: string) => {
    setNewMessage(response)
    setShowQuickResponses(false)
    textareaRef.current?.focus()
  }

  const handleSessionSelect = async (selectedSession: ChatSession) => {
    try {
      setIsLoading(true);
      // Load messages for the selected session
      const sessionMessages = await getMessages(selectedSession.id);
      
      // Mark unread messages as seen
      const unreadMessages = sessionMessages.filter(
        (msg: Message) => msg.receiver_id === user?.id && !msg.seen_at
      );
      
      // Mark messages as seen in parallel
      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map((msg: Message) => markMessageAsSeen(msg.id))
        );
      }
      
      // Update state in a specific order to avoid race conditions
      setMessages(sessionMessages);
      setSession(selectedSession);
      setSidebarOpen(false);

      // Scroll to bottom after a short delay to ensure messages are rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
      // Reset unread count for this session
      setUnreadCounts(prev => ({
        ...prev,
        [selectedSession.id]: 0
      }));

    } catch (error) {
      console.error("Failed to load session messages:", error);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: "Please try again or contact support if the problem persists.",
      });
      setSession(null);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add function to fetch unread counts
  const fetchUnreadCount = async (sessionId: number) => {
    try {
      const response = await unreadCount(sessionId);
      setUnreadCounts(prev => ({
        ...prev,
        [sessionId]: response.count
      }));
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Update unread counts when sessions change
  useEffect(() => {
    allSessions.forEach(session => {
      fetchUnreadCount(session.id);
    });
  }, [allSessions]);

  // Update unread count when new message arrives
  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);

    channel.bind(`message.new`, async (data: { message: Message }) => {
      // Update unread count for the session
      if (data.message.receiver_id === user.id) {
        fetchUnreadCount(data.message.chat_session_id);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user?.id]);

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
        {/* Sidebar - Message Lists */}
        <div
          className={`${sidebarOpen ? "block" : "hidden"} md:block border-r bg-background w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Messages</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/reverend")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="waiting" className="w-full">
            <TabsList className="w-full justify-start px-4 pt-2">
              <TabsTrigger value="waiting" className="flex-1">
                Waiting
                <Badge variant="secondary" className="ml-2">
                  {allSessions.filter((s) => s.status === "waiting").length}
                  {allSessions
                    .filter(s => s.status === "waiting")
                    .reduce((sum, s) => sum + (unreadCounts[s.id] || 0), 0) > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {allSessions
                        .filter(s => s.status === "waiting")
                        .reduce((sum, s) => sum + (unreadCounts[s.id] || 0), 0)}
                    </Badge>
                  )}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex-1">
                Active
                <Badge variant="secondary" className="ml-2">
                  {allSessions.filter((s) => s.status === "active").length}
                  {allSessions
                    .filter(s => s.status === "active")
                    .reduce((sum, s) => sum + (unreadCounts[s.id] || 0), 0) > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {allSessions
                        .filter(s => s.status === "active")
                        .reduce((sum, s) => sum + (unreadCounts[s.id] || 0), 0)}
                    </Badge>
                  )}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {["waiting", "active"].map((status) => (
              <TabsContent key={status} value={status} className="m-0 p-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-1 p-2">
                    {allSessions
                      .filter((s) => s.status === status)
                      .sort((a, b) => {
                        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                      })
                      .map((s) => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                            s.id === session?.id ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleSessionSelect(s)}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={s.user?.avatar_url} />
                              <AvatarFallback>{s.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm truncate">
                                  {s.user?.first_name || "Anonymous"}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(s.updated_at), "h:mm a")}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="px-1 text-xs">
                                  {s.category?.name || "General"}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-end mt-1">
                                <p className="text-xs text-muted-foreground truncate pr-12">{s.initial_message}</p>
                                {unreadCounts[s.id] > 0 && (
                                  <div className="absolute bottom-3 right-3">
                                    <Badge 
                                      variant="destructive" 
                                      className="rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm animate-in fade-in"
                                    >
                                      {unreadCounts[s.id]}
                                    </Badge>
                                  </div>
                                )}
                              </div>
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

        {session ? (
          <>
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
              {/* Add loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                </div>
              )}

              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Avatar>
                    <AvatarImage src={session.user?.avatar_url} />
                    <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{session.user?.first_name || "Anonymous User"}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-2 text-xs">
                        {session.category?.name || "General"}
                      </Badge>
                      <span>Started {format(new Date(session.created_at), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {session.status === 'active' && (
                    <VoiceCall sessionId={session.id} userId={user?.id || 0} />
                  )}

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
                      <DropdownMenuItem onClick={handleCloseSession} className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <ReverendChatArea
                session={session}
                messages={messages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                quickResponses={quickResponses}
                showQuickResponses={showQuickResponses}
                setShowQuickResponses={setShowQuickResponses}
                selectedQuickResponseCategory={selectedQuickResponseCategory}
                setSelectedQuickResponseCategory={setSelectedQuickResponseCategory}
                handleQuickResponse={handleQuickResponse}
                messagesEndRef={messagesEndRef}
                textareaRef={textareaRef}
              />
            </div>

            {/* Info Panel */}
            {showInfo && (
              <ReverendInfoPanel
                session={session}
                onClose={() => setShowInfo(false)}
                onCloseSession={handleCloseSession}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading session...</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Select a Chat Session</h2>
                <p className="text-muted-foreground">Choose a session from the sidebar to start chatting</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}