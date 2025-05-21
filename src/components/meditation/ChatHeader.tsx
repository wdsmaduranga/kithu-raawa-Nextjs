import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Phone, Video, Info, MoreVertical } from "lucide-react"
import { ChatSession, Message } from "@/lib/types"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { initiateCall, acceptCall, rejectCall, endCall } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Pusher from "pusher-js"
import { useUserStore } from "@/stores/userStore"
import type { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  IMicrophoneAudioTrack 
} from 'agora-rtc-sdk-ng';

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
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null)
  const [isAgoraReady, setIsAgoraReady] = useState(false)
  const [AgoraRTC, setAgoraRTC] = useState<any>(null)

  // Initialize Agora on client side
  useEffect(() => {
    const initAgora = async () => {
      try {
        // This will only run on client side
        if (typeof window !== 'undefined') {
          const Agora = await import('agora-rtc-sdk-ng');
          setAgoraRTC(Agora);
          setIsAgoraReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize Agora:', error);
      }
    };

    initAgora();
  }, []);

  // Initialize Agora client
  const initializeAgoraClient = async () => {
    if (!isAgoraReady || !AgoraRTC) return null;
    
    if (!agoraClient) {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);
      return client;
    }
    return agoraClient;
  };

  // Join Agora channel
  const joinAgoraChannel = async (appId: string, channel: string, token: string, uid: number) => {
    if (!isAgoraReady || !AgoraRTC) {
      throw new Error('Agora is not ready');
    }

    const client = await initializeAgoraClient();
    if (!client) {
      throw new Error('Failed to initialize Agora client');
    }

    try {
      // Join the channel
      await client.join(appId, channel, token, uid);

      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([audioTrack]);
      setLocalAudioTrack(audioTrack);

      // Set up event handlers
      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          // Play the remote audio
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
        client.unsubscribe(user);
      });

      return { client, audioTrack };
    } catch (error) {
      console.error('Error joining channel:', error);
      throw error;
    }
  };

  // Leave Agora channel
  const leaveAgoraChannel = async () => {
    if (!isAgoraReady) return;

    if (localAudioTrack) {
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }

    if (agoraClient) {
      await agoraClient.leave();
      setAgoraClient(null);
    }
  };

  useEffect(() => {
    if (!user || !isAgoraReady) return;
    Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`user.${user.id}`)

    // Listen for incoming calls
    channel.bind('call.incoming', async (data: any) => {
      setIncomingCallData(data);
      setCallStatus('incoming');
      setShowCallDialog(true);
    })

    // Listen for call status updates
    channel.bind('call.answered', async (data: any) => {
      console.log(data);
      if (data.session?.id === session.id) {
        setCallStatus('connected');
        console.log(data.channel_name);
        console.log(data.token);
        console.log(data.caller_id);
        try {
          // Join the Agora channel
          await joinAgoraChannel(
            process.env.NEXT_PUBLIC_AGORA_APP_ID!,
            data.channel_name,
            data.token,
            data.caller_id
          );
        } catch (error) {
          console.error('Failed to join Agora channel:', error);
          toast({
            variant: "destructive",
            title: "Call Error",
            description: "Failed to establish voice connection",
          });
        }
      }
    })

    channel.bind('call.rejected', () => {
      setCallStatus('idle')
      setShowCallDialog(false)
      toast({
        title: "Call Rejected",
        description: "The other party rejected the call",
      })
    })

    channel.bind('call.ended', async () => {
      setCallStatus('idle')
      setShowCallDialog(false)
      await leaveAgoraChannel();
      toast({
        title: "Call Ended",
        description: "The call has ended",
      })
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`user.${user.id}`)
      leaveAgoraChannel();
    }
  }, [user?.id, session.id, isAgoraReady])

  const handleInitiateCall = async () => {
    if (!isAgoraReady) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Voice call is not ready. Please try again.",
      });
      return;
    }

    try {
      setCallStatus('calling')
      setShowCallDialog(true)
      const response = await initiateCall(session.id)
      // Join the Agora channel
      // await joinAgoraChannel(
      //   process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      //   response.channel_name,
      //   response.token,
      //   user!.id
      // );
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
    if (!isAgoraReady) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Voice call is not ready. Please try again.",
      });
      return;
    }

    try {
      const response = await acceptCall(session.id)
      setCallStatus('connected')
      
      // Join the Agora channel
      await joinAgoraChannel(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        response.channel_name,
        response.token,
        user!.id
      );
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
      await leaveAgoraChannel();
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