import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Phone, Video, Info, MoreVertical, Volume2, PhoneOff } from "lucide-react"
import { ChatSession, Message } from "@/lib/types"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { initiateCall, acceptCall, rejectCall, endCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Pusher from "pusher-js"
import { useUserStore } from "@/stores/userStore"

interface ChatHeaderProps {
  session: ChatSession;
  latestMessage?: Message;
  onInfoClick: () => void;
  showBackButton?: boolean;
}

// Client-side only component wrapper
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}

export function ChatHeader({ session, latestMessage, onInfoClick, showBackButton = false }: ChatHeaderProps) {
  const { toast } = useToast()
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle')
  const [incomingCallData, setIncomingCallData] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useUserStore()
  const zegoEngine = useRef<any>(null)
  const localStream = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`user.${user.id}`)

    channel.bind('call.incoming', (data: any) => {
      setIncomingCallData(data)
      setCallStatus('incoming')
      setShowCallDialog(true)
    })

    channel.bind('call.answered', async (data: any) => {
      if (data.session?.id === session.id) {
        setCallStatus('connected')
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
      const { ZegoExpressEngine } = await import('zego-express-engine-webrtc')
      
      zegoEngine.current = new ZegoExpressEngine(
        parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0'),
        process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''
      )

      await zegoEngine.current.loginRoom(
        zegoData.channel_name,
        zegoData.token_data.token,
        { userID: user?.id.toString() || '', userName: user?.first_name || '' },
        { userUpdate: true }
      )

      localStream.current = await zegoEngine.current.createStream({
        camera: { audio: true, video: false }
      })

      await zegoEngine.current.startPublishing(localStream.current)

      // Start call timer
      startCallTimer()

      // Listen for remote streams
      zegoEngine.current.on('publisherStateUpdate', (result: any) => {
        console.log('Publisher state update:', result)
      })

      zegoEngine.current.on('playerStateUpdate', (result: any) => {
        console.log('Player state update:', result)
      })

      // Listen for remote user joining
      zegoEngine.current.on('roomUserUpdate', (roomID: string, updateType: 'ADD' | 'DELETE', userList: any[]) => {
        console.log('Room user update:', roomID, updateType, userList)
        if (updateType === 'ADD') {
          // Handle remote user joining
          userList.forEach(user => {
            if (user.userID !== user?.id.toString()) {
              // Start playing remote stream
              zegoEngine.current?.startPlayingStream(user.streamID)
            }
          })
        }
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

  const startCallTimer = () => {
    setCallDuration(0)
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
    setCallDuration(0)
  }

  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleSpeaker = () => {
    if (zegoEngine.current) {
      (zegoEngine.current as any).setAudioOutputDevice(isSpeakerOn ? 'earpiece' : 'speaker')
      setIsSpeakerOn(!isSpeakerOn)
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
    stopCallTimer()
  }

  const handleInitiateCall = async () => {
    try {
      setCallStatus('calling')
      setShowCallDialog(true)
      const response = await initiateCall(session.id)
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
    <ClientOnly>
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
            
            {callStatus === 'connected' && (
              <div className="text-sm text-muted-foreground">
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </div>
            )}
            
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
              
              {callStatus === 'connected' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${isMuted ? 'bg-red-100' : ''}`}
                    onClick={toggleMute}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${!isSpeakerOn ? 'bg-red-100' : ''}`}
                    onClick={toggleSpeaker}
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <Button onClick={handleEndCall} variant="destructive" className="h-10 w-10 rounded-full">
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {(callStatus === 'calling') && (
                <Button onClick={handleEndCall} variant="destructive">
                  End Call
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  );
}