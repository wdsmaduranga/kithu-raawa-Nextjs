import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { Send, Paperclip, Smile, FileText, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Check, CheckCheck } from "lucide-react"
import type { ChatSession, Message } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/stores/userStore"
import { initiateCall, acceptCall, rejectCall, endCall } from "@/lib/api"
import Pusher from "pusher-js"

interface ReverendChatAreaProps {
  session: ChatSession
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isSending: boolean
  quickResponses: any[]
  showQuickResponses: boolean
  setShowQuickResponses: (show: boolean) => void
  selectedQuickResponseCategory: string
  setSelectedQuickResponseCategory: (category: string) => void
  handleQuickResponse: (response: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export function ReverendChatArea({
  session,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isSending,
  quickResponses,
  showQuickResponses,
  setShowQuickResponses,
  selectedQuickResponseCategory,
  setSelectedQuickResponseCategory,
  handleQuickResponse,
  messagesEndRef,
  textareaRef,
}: ReverendChatAreaProps) {
  const { toast } = useToast()
  const { user } = useUserStore()
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle')
  const [incomingCallData, setIncomingCallData] = useState<any>(null)

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    // Subscribe to the user's channel
    const channel = pusher.subscribe(`user.${user.id}`)

    // Listen for incoming calls
    channel.bind('call.incoming', (data: any) => {
      setIncomingCallData(data)
      setCallStatus('incoming')
      setShowCallDialog(true)
    })

    // Listen for call status updates
    channel.bind('call.answered', (data: any) => {
      if (data.session?.id === session.id) {
        setCallStatus('connected')
      }
    })

    channel.bind('call.rejected', (data: any) => {
      if (data.session?.id === session.id) {
        setCallStatus('idle')
        setShowCallDialog(false)
        toast({
          title: "Call Rejected",
          description: "The other party rejected the call",
        })
      }
    })

    channel.bind('call.ended', (data: any) => {
      if (data.session?.id === session.id) {
        setCallStatus('idle')
        setShowCallDialog(false)
        toast({
          title: "Call Ended",
          description: "The call has ended",
        })
      }
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user.${user.id}`)
    }
  }, [user?.id, session.id])

  const handleInitiateCall = async () => {
    try {
      setCallStatus('calling')
      setShowCallDialog(true)
      await initiateCall(session.id)
    } catch (error) {
      console.error('Failed to initiate call:', error)
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Failed to initiate call. Please try again.",
      })
      setCallStatus('idle')
      setShowCallDialog(false)
    }
  }

  const handleAcceptCall = async () => {
    try {
      await acceptCall(session.id)
      setCallStatus('connected')
    } catch (error) {
      console.error('Failed to accept call:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept call. Please try again.",
      })
    }
  }

  const handleRejectCall = async () => {
    try {
      await rejectCall(session.id)
      setCallStatus('idle')
      setShowCallDialog(false)
    } catch (error) {
      console.error('Failed to reject call:', error)
    }
  }

  const handleEndCall = async () => {
    try {
      await endCall(session.id)
      setCallStatus('idle')
      setShowCallDialog(false)
    } catch (error) {
      console.error('Failed to end call:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end call. Please try again.",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[100px] pr-24 resize-none"
              onKeyDown={handleKeyPress}
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Dialog open={showQuickResponses} onOpenChange={setShowQuickResponses}>
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
                            {category.responses.map((response: string, index: number) => (
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
                onClick={onSendMessage}
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

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'incoming' && 'Incoming Call'}
              {callStatus === 'connected' && 'Call Connected'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user?.avatar_url} />
              <AvatarFallback>{session.user?.first_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg font-semibold">{session.user?.first_name || 'Anonymous'}</h3>
            
            <div className="flex gap-4">
              {callStatus === 'incoming' && (
                <>
                  <Button onClick={handleAcceptCall} variant="default" className="bg-green-600 hover:bg-green-700">
                    Accept
                  </Button>
                  <Button onClick={handleRejectCall} variant="destructive">
                    Reject
                  </Button>
                </>
              )}
              
              {(callStatus === 'calling' || callStatus === 'connected') && (
                <Button onClick={handleEndCall} variant="destructive">
                  End Call
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}