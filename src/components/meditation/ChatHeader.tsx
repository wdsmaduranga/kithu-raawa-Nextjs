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
import { useUserStore } from "@/stores/userStore"

// We'll import these dynamically in useEffect
let Pusher: any;
let AgoraRTC: any;

if (typeof window !== 'undefined') {
  // Only import on client side
  Pusher = require('pusher-js');
  AgoraRTC = require('agora-rtc-sdk-ng');
}

interface ChatHeaderProps {
  session: ChatSession;
  latestMessage?: Message;
  onInfoClick: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ session, latestMessage, onInfoClick, showBackButton = false }: ChatHeaderProps) {
  const { toast } = useToast()
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected' | 'connecting'>('idle')
  const [incomingCallData, setIncomingCallData] = useState<any>(null)
  const { user } = useUserStore()
  const [agoraEngine, setAgoraEngine] = useState<any>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null)
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<any>(null)

  // Initialize Agora client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setAgoraEngine(client);

    return () => {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (remoteAudioTrack) {
        remoteAudioTrack.close();
      }
      if (client) {
        client.leave();
      }
    };
  }, []);

  const forceStopMicrophone = async () => {
    console.log("Force stopping microphone...");
    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
        localAudioTrack.close();
        setLocalAudioTrack(null);
      } catch (error) {
        console.error("Error force stopping microphone:", error);
      }
    }
    if (agoraEngine) {
      try {
        await agoraEngine.leave();
      } catch (error) {
        console.error("Error leaving Agora engine:", error);
      }
    }
  };

  // Handle tab/window visibility and focus changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab hidden - stopping microphone");
        forceStopMicrophone();
        setCallStatus('idle');
        setShowCallDialog(false);
      }
    };

    const handleFocusLoss = () => {
      console.log("Window lost focus - stopping microphone");
      forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
    };

    const handleBeforeUnload = () => {
      console.log("Window closing - stopping microphone");
      forceStopMicrophone();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLoss);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLoss);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);

    channel.bind('call.incoming', (data: any) => {
      setIncomingCallData(data);
      setCallStatus('incoming');
      setShowCallDialog(true);
    });

    channel.bind('call.answered', async (data: any) => {
      console.log("call.answered", data);
      if (data.session?.id === session.id) {
        setCallStatus('connected');
        if (data.agora) {
          await joinCall(data.agora.channel_name, data.agora.token, data.agora.u_id);
        }
      }
    });

    channel.bind('call.rejected', async (data: any) => {
      console.log("call.rejected", data);
      await forceStopMicrophone();
      
      if (data.session?.id === session.id) {
        console.log("Handling rejected call for session:", session.id);
        setCallStatus('idle');
        setShowCallDialog(false);
      }
    });

    channel.bind('call.ended', async (data: any) => {
      console.log("call.ended", data);
      await forceStopMicrophone();
      
      if (data.session?.id === session.id) {
        console.log("Handling ended call for session:", session.id);
        setCallStatus('idle');
        setShowCallDialog(false);
      }
    });

    return () => {
      forceStopMicrophone();
      channel.unbind_all();
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user?.id, session.id]);

  const joinCall = async (channelName: string, token: string, uid: number) => {
    if (typeof window === 'undefined' || !agoraEngine) return;

    try {
      console.log("Joining call with channel:", channelName);
      
      // Clean up any existing tracks before joining
      await forceStopMicrophone();
      
      // Join the Agora channel
      await agoraEngine.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        uid
      );
      console.log("Successfully joined Agora channel");

      // Create and acquire local audio track
      console.log("Creating local audio track...");
      const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(localTrack);

      // Publish local track to channel
      console.log("Publishing local track...");
      await agoraEngine.publish(localTrack);
      console.log("Local track published successfully");

      // Set up remote user audio handling
      agoraEngine.on("user-published", async (user: any, mediaType: string) => {
        console.log("Remote user published:", user.uid, mediaType);
        try {
          await agoraEngine.subscribe(user, mediaType);
          if (mediaType === "audio") {
            setRemoteAudioTrack(user.audioTrack);
            user.audioTrack.play();
            console.log("Playing remote audio track");
          }
        } catch (error) {
          console.error("Error handling remote user audio:", error);
          toast({
            variant: "destructive",
            title: "Audio Error",
            description: "Failed to connect to other participant's audio.",
          });
        }
      });

      // Handle remote user unpublishing
      agoraEngine.on("user-unpublished", async (user: any) => {
        console.log("Remote user unpublished:", user.uid);
        if (remoteAudioTrack) {
          remoteAudioTrack.stop();
          setRemoteAudioTrack(null);
        }
      });

    } catch (error) {
      console.error("Error joining call:", error);
      // Clean up any partial setup
      await forceStopMicrophone();
      throw error; // Re-throw to be handled by caller
    }
  };

  const handleInitiateCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      setCallStatus('calling');
      setShowCallDialog(true);
      const response = await initiateCall(session.id);
      if (response.channel_name && response.token) {
        await joinCall(response.channel_name, response.token, user?.id!);
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Failed to initiate call. Please try again.",
      });
    }
  };

  const handleAcceptCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      // First update UI to show we're processing
      setCallStatus('connecting');
      
      // Get call acceptance tokens from backend
      const response = await acceptCall(session.id);
      
      if (!response.channel_name || !response.token) {
        throw new Error('Invalid response from server');
      }

      // Initialize Agora and join call
      try {
        await joinCall(response.channel_name, response.token, user?.id!);
        // Only update status after successfully joining
        setCallStatus('connected');
      } catch (error) {
        // If join fails, clean up and reset
        console.error('Failed to join call:', error);
        await forceStopMicrophone();
        setCallStatus('idle');
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Failed to accept call:', error);
      // Ensure we clean up any partial resources
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept call. Please try again.",
      });
    }
  };

  const handleRejectCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
      await rejectCall(session.id);
    } catch (error) {
      console.error('Failed to reject call:', error);
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
    }
  };

  const handleEndCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
      await endCall(session.id);
    } catch (error) {
      console.error('Failed to end call:', error);
      await forceStopMicrophone();
      setCallStatus('idle');
      setShowCallDialog(false);
    }
  };

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
    ? `${latestMessage.receiver?.first_name} ${latestMessage.receiver?.last_name}`
    : session.user ? `${session.user.first_name} ${session.user.last_name}` 
    : 'Anonymous';

  if (typeof window === 'undefined') {
    return null; // Or a loading state
  }

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
                  className={`text-muted-foreground hover:text-foreground ${callStatus !== 'idle' ? 'bg-primary text-primary-foreground' : ''}`}
                  disabled={session.status !== 'active' || callStatus === 'calling' || callStatus === 'incoming'}
                  onClick={callStatus === 'connected' ? handleEndCall : handleInitiateCall}
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{callStatus === 'connected' ? 'End Call' : 'Voice Call'}</p>
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