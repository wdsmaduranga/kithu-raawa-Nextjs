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
  const [localVolume, setLocalVolume] = useState(100);
  const [remoteVolume, setRemoteVolume] = useState(100);
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);

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
      console.log("Call answered with data:", data);
      if (data.session?.id === session.id) {
        try {
          // Extract Agora data from the response
          const agoraData = data.agora || {
            channel_name: `chat_session_${session.id}`,
            token: data.token,
            u_id: data.u_id
          };
          
          if (!agoraData.channel_name || !agoraData.token) {
            throw new Error('Invalid Agora data received');
          }

          console.log("Joining call with Agora data:", agoraData);
          await joinCall(agoraData.channel_name, agoraData.token, user?.id!);
          setCallStatus('connected');
        } catch (error) {
          console.error("Error joining call after answer:", error);
          await cleanupAudioTracks();
          setCallStatus('idle');
          setShowCallDialog(false);
          toast({
            variant: "destructive",
            title: "Call Error",
            description: "Failed to join the call. Please try again.",
          });
        }
      }
    });

    channel.bind('call.rejected', async (data: any) => {
      console.log("call.rejected", data);
      
      if (data.session?.id === session.id) {
          console.log("Handling rejected call for session:", session.id);
          await cleanupAudioTracks();
          setCallStatus('idle');
          setShowCallDialog(false);
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

  const handleInitiateCall = async () => {
    if (typeof window === 'undefined') return;

    try {
      // Check audio device first
      const hasAudioDevice = await checkAudioDevice();
      if (!hasAudioDevice) return;

      setCallStatus('calling');
      setShowCallDialog(true);
      const response = await initiateCall(session.id);
      if (!response.channel_name || !response.token) {
        throw new Error('Invalid response from call initiation');
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Failed to initiate call. Please try again.",
      });
      setCallStatus('idle');
      setShowCallDialog(false);
    }
  };

  const joinCall = async (channelName: string, token: string, uid: number) => {
    if (typeof window === 'undefined' || !agoraEngine) return;

    try {
      console.log("Starting to join call with:", { channelName, token, uid });
      
      // First leave any existing call
      if (agoraEngine.connectionState === 'CONNECTED') {
        console.log("Leaving existing call before joining new one");
        await agoraEngine.leave();
      }

      // Enable audio autoplay
      AgoraRTC.setParameter('AUDIO_AUTO_PLAY', true);

      console.log("Joining Agora channel...");
      await agoraEngine.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        uid
      );
      console.log("Successfully joined Agora channel");

      // Create and publish local audio track with explicit settings
      console.log("Creating microphone audio track...");
      const localTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "music_standard",
        AEC: true, // Enable echo cancellation
        ANS: true, // Enable noise suppression
        AGC: true  // Enable auto gain control
      });
      
      // Set volume to maximum
      localTrack.setVolume(100);
      
      console.log("Local audio track created, publishing...");
      setLocalAudioTrack(localTrack);
      await agoraEngine.publish(localTrack);
      console.log("Local audio track published successfully");

      // Set up user-published event handler
      agoraEngine.on("user-published", async (user: any, mediaType: string) => {
        console.log("Remote user published:", { userId: user.uid, mediaType });
        
        if (mediaType === "audio") {
          console.log("Subscribing to remote audio...");
          await agoraEngine.subscribe(user, mediaType);
          console.log("Successfully subscribed to remote audio");
          
          const remoteTrack = user.audioTrack;
          setRemoteAudioTrack(remoteTrack);
          
          // Set remote audio volume to maximum
          remoteTrack.setVolume(100);
          
          console.log("Playing remote audio track...");
          try {
            await remoteTrack.play();
            console.log("Remote audio playback started");
            
            // Verify audio is actually playing
            const isPlaying = remoteTrack.isPlaying;
            console.log("Remote audio track playing status:", isPlaying);
            
            // Check audio settings
            console.log("Remote audio track settings:", {
              volume: remoteTrack.getVolume(),
              state: remoteTrack.getState(),
            });
          } catch (error) {
            console.error("Error playing remote audio:", error);
            // Try alternative playback method
            try {
              console.log("Trying alternative playback method...");
              await remoteTrack.play(null as any);
              console.log("Alternative playback method succeeded");
            } catch (e) {
              console.error("Alternative playback also failed:", e);
            }
          }
        }
      });

      // Set up user-unpublished event handler
      agoraEngine.on("user-unpublished", async (user: any, mediaType: string) => {
        console.log("Remote user unpublished:", { userId: user.uid, mediaType });
        if (mediaType === "audio") {
          if (user.audioTrack) {
            user.audioTrack.stop();
          }
          setRemoteAudioTrack(null);
        }
      });

      // Set up connection-state-change handler
      agoraEngine.on("connection-state-change", (state: string, reason: string) => {
        console.log("Connection state changed:", { state, reason });
      });

      // Add error event handler
      agoraEngine.on("error", (err: any) => {
        console.error("Agora engine error:", err);
      });

      // Add exception event handler
      agoraEngine.on("exception", (event: any) => {
        console.warn("Agora engine exception:", event);
      });

    } catch (error) {
      console.error("Error in joinCall:", error);
      await cleanupAudioTracks();
      toast({
        variant: "destructive",
        title: "Call Error",
        description: "Failed to join the call. Please check your audio permissions and try again.",
      });
      throw error;
    }
  };

  // Add function to check audio device
  const checkAudioDevice = async () => {
    try {
      const devices = await AgoraRTC.getMicrophones();
      console.log("Available audio devices:", devices);
      
      if (devices.length === 0) {
        console.error("No audio devices found!");
        toast({
          variant: "destructive",
          title: "No Audio Device",
          description: "No microphone found. Please connect a microphone and try again.",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking audio devices:", error);
      return false;
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
      console.log("Starting audio cleanup...");
      
      // Clean up local audio track
      if (localAudioTrack) {
        console.log("Closing local audio track...");
        try {
          localAudioTrack.setEnabled(false);
          await localAudioTrack.stop();
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
          remoteAudioTrack.stop();
          remoteAudioTrack.close();
        } catch (e) {
          console.error("Error closing remote track:", e);
        }
        setRemoteAudioTrack(null);
      }

      // Leave the Agora channel
      if (agoraEngine && agoraEngine.connectionState === 'CONNECTED') {
        console.log("Leaving Agora channel...");
        try {
          await agoraEngine.leave();
          console.log("Successfully left Agora channel");
        } catch (e) {
          console.error("Error leaving Agora channel:", e);
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

  const handleVolumeChange = async (isLocal: boolean, value: number) => {
    try {
      if (isLocal && localAudioTrack) {
        await localAudioTrack.setVolume(value);
        setLocalVolume(value);
      } else if (!isLocal && remoteAudioTrack) {
        await remoteAudioTrack.setVolume(value);
        setRemoteVolume(value);
      }
    } catch (error) {
      console.error("Error adjusting volume:", error);
    }
  };

  const testAudioPlayback = async () => {
    try {
      if (!remoteAudioTrack) {
        setAudioPlaybackError("No remote audio track available");
        return;
      }

      // Try to play audio again
      await remoteAudioTrack.stop();
      await remoteAudioTrack.play();
      
      const isPlaying = remoteAudioTrack.isPlaying;
      console.log("Audio playback test:", {
        isPlaying,
        volume: remoteAudioTrack.getVolume(),
        state: remoteAudioTrack.getState()
      });

      if (!isPlaying) {
        setAudioPlaybackError("Audio track is not playing");
      } else {
        setAudioPlaybackError(null);
      }
    } catch (error) {
      console.error("Audio playback test failed:", error);
      setAudioPlaybackError("Failed to play audio: " + (error as Error).message);
    }
  };

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
            
            {callStatus === 'connected' && (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Microphone Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localVolume}
                    onChange={(e) => handleVolumeChange(true, Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Other Person's Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={remoteVolume}
                    onChange={(e) => handleVolumeChange(false, Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={testAudioPlayback}
                  variant="outline" 
                  className="w-full"
                >
                  Test Audio Playback
                </Button>

                {audioPlaybackError && (
                  <p className="text-sm text-red-500 mt-2">{audioPlaybackError}</p>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Audio Status:</p>
                  <ul className="list-disc pl-4 mt-1">
                    <li>Local Track: {localAudioTrack ? "Active" : "Not Active"}</li>
                    <li>Remote Track: {remoteAudioTrack ? (remoteAudioTrack.isPlaying ? "Playing" : "Not Playing") : "Not Available"}</li>
                  </ul>
                </div>
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