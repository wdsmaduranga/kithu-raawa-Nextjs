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
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'incoming' | 'connected'>('idle')
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
      if (data.session?.id === session.id) {
        setCallStatus('connected');
        if (data.agora) {
          await joinCall(data.agora.channel_name, data.agora.token, data.agora.u_id);
        }
      }
    });

    channel.bind('call.rejected', async (data: any) => {
      console.log("call.rejected event received", data.session?.id);
      
      if (data.session?.id === session.id) {
        console.log("Handling rejected call for session:", session.id);
        
        // First update UI state
        setCallStatus('idle');
        setShowCallDialog(false);
        
        // Then cleanup audio tracks
        await cleanupAudioTracks();

        if (callStatus === 'calling') {
          toast({
            title: "Call Rejected",
            description: "The other party rejected the call",
          });
        }
      }
    });

    channel.bind('call.ended', async (data: any) => {
      console.log("call.ended", data);
      if (data.session?.id === session.id) {
        console.log("Handling ended call for session:", session.id);
        await cleanupAudioTracks();
        setCallStatus('idle');
        setShowCallDialog(false);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("Component unmounting - cleaning up resources");
      cleanupAudioTracks().catch(e => {
        console.error("Cleanup error on unmount:", e);
      });
      channel.unbind_all();
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user?.id, session.id, callStatus]);

  const joinCall = async (channelName: string, token: string, uid: number) => {
    if (typeof window === 'undefined' || !agoraEngine) return;

    try {
      await agoraEngine.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        uid
      );

      const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(localTrack);
      await agoraEngine.publish(localTrack);

      agoraEngine.on("user-published", async (user: any, mediaType: string) => {
        await agoraEngine.subscribe(user, mediaType);
        if (mediaType === "audio") {
          setRemoteAudioTrack(user.audioTrack);
          user.audioTrack.play();
        }
      });
    } catch (error) {
      console.error("Error joining call:", error);
      toast({
        variant: "destructive",
        title: "Call Error",
        description: "Failed to join the call. Please try again.",
      });
    }
  };

  const handleInitiateCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Create audio track before initiating call
      const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(localTrack);
      setCallStatus('calling');
      setShowCallDialog(true);

      try {
        const response = await initiateCall(session.id);
        if (response.channel_name && response.token) {
          await joinCall(response.channel_name, response.token, user?.id!);
        }
      } catch (error) {
        // If call initiation fails, cleanup the audio track
        console.error('Failed to initiate call:', error);
        await cleanupAudioTracks();
        setCallStatus('idle');
        setShowCallDialog(false);
        toast({
          variant: "destructive",
          title: "Call Failed",
          description: "Failed to initiate call. Please try again.",
        });
      }
    } catch (error) {
      console.error('Failed to create audio track:', error);
      setCallStatus('idle');
      setShowCallDialog(false);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Failed to access microphone. Please check your permissions.",
      });
    }
  };

  const handleAcceptCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      const response = await acceptCall(session.id);
      if (response.channel_name && response.token) {
        await joinCall(response.channel_name, response.token, user?.id!);
        setCallStatus('connected');
      }
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept call. Please try again.",
      });
    }
  };

  const cleanupAudioTracks = async () => {
    try {
      console.log("Cleaning up audio tracks...");
      
      // Clean up local audio track
      if (localAudioTrack) {
        console.log("Closing local audio track...");
        try {
          // Try to stop first
          await localAudioTrack.stop();
        } catch (e) {
          console.log("Stop not available for local track, proceeding with close");
        }
        
        try {
          await localAudioTrack.close();
        } catch (e) {
          console.error("Error closing local track:", e);
        }
        setLocalAudioTrack(null);
      }

      // Clean up remote audio track
      if (remoteAudioTrack) {
        console.log("Closing remote audio track...");
        try {
          // Try to stop first
          await remoteAudioTrack.stop();
        } catch (e) {
          console.log("Stop not available for remote track, proceeding with close");
        }
        
        try {
          await remoteAudioTrack.close();
        } catch (e) {
          console.error("Error closing remote track:", e);
        }
        setRemoteAudioTrack(null);
      }

      // Leave the Agora engine
      if (agoraEngine) {
        console.log("Leaving Agora engine...");
        try {
          await agoraEngine.leave();
        } catch (e) {
          console.error("Error leaving Agora engine:", e);
        }
      }

      console.log("Audio cleanup completed");
    } catch (error) {
      console.error("Error during audio cleanup:", error);
    }
  };

  const handleRejectCall = async () => {
    if (typeof window === 'undefined') return;

    console.log("Rejecting call...");
    try {
      // First cleanup audio resources
      await cleanupAudioTracks();
      
      // Then update UI state
      setCallStatus('idle');
      setShowCallDialog(false);
      
      // Finally make the API call
      await rejectCall(session.id);

      toast({
        title: "Call Rejected",
        description: "You have rejected the call",
      });
    } catch (error) {
      console.error('Failed to reject call:', error);
      // Ensure cleanup happens even if API call fails
      await cleanupAudioTracks();
      setCallStatus('idle');
      setShowCallDialog(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject call. Please try again.",
      });
    }
  };

  const handleEndCall = async () => {
    if (typeof window === 'undefined') return;
    console.log("Ending call...");
    try {
      // First cleanup audio resources
      await cleanupAudioTracks();
      // Then update UI state
      setCallStatus('idle');
      setShowCallDialog(false);
      
      // Finally make the API call
      await endCall(session.id);

      toast({
        title: "Call Ended",
        description: "The call has been ended",
      });
    } catch (error) {
      console.error('Failed to end call:', error);
      // Ensure cleanup happens even if API call fails
      await cleanupAudioTracks();
      setCallStatus('idle');
      setShowCallDialog(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end call. Please try again.",
      });
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