import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Phone, Video, Info, MoreVertical } from "lucide-react"
import { ChatSession, Message } from "@/lib/types"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { initiateCall, acceptCall, rejectCall, endCall, getCallToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Pusher from "pusher-js"
import { useUserStore } from "@/stores/userStore"
import { ZegoExpressEngine } from 'zego-express-engine-webrtc'

interface ChatHeaderProps {
  session: ChatSession;
  latestMessage?: Message;
  onInfoClick: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ session, latestMessage, onInfoClick, showBackButton = false }: ChatHeaderProps) {
  const { toast } = useToast()
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle')
  const [incomingCallData, setIncomingCallData] = useState<any>(null)
  const { user } = useUserStore()
  const zegoEngine = useRef<ZegoExpressEngine | null>(null)
  const localStream = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`user.${user.id}`)

    // Listen for incoming calls
    channel.bind('call.incoming', (data: any) => {
      setIncomingCallData(data)
      setCallStatus('incoming')
      setShowCallDialog(true)
    })

    // Listen for call status updates
    channel.bind('call.answered', async (data: any) => {
      if (data.session?.id === session.id) {
        setCallStatus('connected')
        // Initialize ZEGOCLOUD engine and join room
        await initializeZegoEngine(data.zego_data)
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
        stopLocalStream()
        toast({
          title: "Call Ended",
          description: "The call has ended",
        })
      }
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user.${user.id}`)
      stopLocalStream()
    }
  }, [user?.id, session.id])

  const initializeZegoEngine = async (zegoData: any) => {
    try {
      // Initialize ZEGOCLOUD engine
      zegoEngine.current = new ZegoExpressEngine(
        parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0'),
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''
      )

      // Login to ZEGOCLOUD
      await zegoEngine.current.loginRoom(
        zegoData.channel_name,
        zegoData.token_data.token,
        { userID: user?.id.toString() || '', userName: user?.first_name || '' },
        { userUpdate: true }
      )

      // Start local audio stream
      localStream.current = await zegoEngine.current.createStream({
        camera: { audio: true, video: false }
      })

      // Publish stream
      await (zegoEngine.current as any).startPublishing(localStream.current)

      // Listen for remote streams
      zegoEngine.current.on('publisherStateUpdate', (result) => {
        console.log('Publisher state update:', result)
      })

      zegoEngine.current.on('playerStateUpdate', (result) => {
        console.log('Player state update:', result)
      })
    } catch (error) {
      console.error('Failed to initialize ZEGOCLOUD:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize voice call. Please try again.",
      })
    }
  }

  const stopLocalStream = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop())
      localStream.current = null
    }
    if (zegoEngine.current) {
      zegoEngine.current.destroyEngine()
      zegoEngine.current = null
    }
  }

  const handleInitiateCall = async () => {
    try {
      setCallStatus('calling')
      setShowCallDialog(true)
      const response = await initiateCall(session.id)
      // Initialize ZEGOCLOUD engine and join room
      await initializeZegoEngine(response)
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
      const response = await acceptCall(session.id)
      setCallStatus('connected')
      // Initialize ZEGOCLOUD engine and join room
      await initializeZegoEngine(response)
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
      stopLocalStream()
    } catch (error) {
      console.error('Failed to end call:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end call. Please try again.",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }   
  };

  const senderName = latestMessage 
    ? `${latestMessage.receiver?.first_name} ${latestMessage.receiver?.last_name}`:'';

  return (
    <>
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={`/images/categories/${session.category?.icon}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {senderName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{senderName}</h3>
              <Badge variant="outline" className={getStatusColor(session.status)}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {session.category?.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  disabled={session.status !== 'active'}
                  onClick={handleInitiateCall}
                >
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  disabled={session.status !== 'active'}
                >
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
                  onClick={onInfoClick}
                >
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Session Information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More Options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              <AvatarImage src={`/images/categories/${session.category?.icon}`} />
              <AvatarFallback>{senderName?.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg font-semibold">{senderName}</h3>
            
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
  );
}