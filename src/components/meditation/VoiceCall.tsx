import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiateCall, endCall, rejectCall } from '@/lib/api';
import Pusher from 'pusher-js';

interface VoiceCallProps {
  sessionId: number;
  userId: number;
  userName?: string;
}

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

// Initialize Agora client
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export function VoiceCall({ sessionId, userId, userName = 'User' }: VoiceCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState<number | null>(null);
  const [callerName, setCallerName] = useState<string>('');
  const localTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { toast } = useToast();

  // Create audio elements for ringtones
  useEffect(() => {
    ringToneRef.current = new Audio('/sounds/ringtone.mp3');
    ringToneRef.current.loop = true;
    
    return () => {
      stopRingtone();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
      }
    };
  }, []);

  const startRinging = () => {
    ringToneRef.current?.play().catch(console.error);
    
    if (navigator.vibrate) {
      const vibratePattern: number[] = [500, 200, 500, 200, 500];
      navigator.vibrate(vibratePattern);
    }

    ringTimeoutRef.current = setTimeout(() => {
      handleRejectCall();
      toast({
        title: "Missed Call",
        description: `You missed a call from ${userName}`,
        duration: 5000,
      });
    }, 30000);
  };

  const stopRingtone = () => {
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
  };

  const initializeAgoraClient = async () => {
    try {
      // Join the channel using sessionId as the channel name
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        sessionId.toString(),
        null, // Use null for temp token, or implement token server
        userId
      );

      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTrackRef.current = audioTrack;
      await client.publish([audioTrack]);

      // Set up event listeners for remote users
      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        if (mediaType === "audio") {
          await client.subscribe(user, mediaType);
          user.audioTrack?.play();
          setCallStatus('connected');
          stopRingtone();
        }
      });

      client.on("user-left", () => {
        toast({
          title: "Call Ended",
          description: "The other participant has left the call",
          duration: 3000,
        });
        cleanup();
      });

      return true;
    } catch (error) {
      console.error('Error initializing Agora client:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to initialize call. Please check your internet connection.",
        duration: 3000,
      });
      return false;
    }
  };

  const startCall = async () => {
    try {
      await initiateCall(sessionId);
      const success = await initializeAgoraClient();
      
      if (success) {
        setIsCallActive(true);
        setCallStatus('connecting');
        
        toast({
          title: "Calling...",
          description: `Calling ${userName}`,
          duration: 3000,
        });

        ringToneRef.current?.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Could not initiate the call. Please try again.",
      });
      cleanup();
    }
  };

  const handleAcceptCall = async () => {
    try {
      const success = await initializeAgoraClient();
      
      if (success) {
        setIncomingCall(false);
        setIsCallActive(true);
        setCallStatus('connected');
        stopRingtone();
        
        toast({
          title: "✅ Connected",
          description: "Call connection established",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Could not accept the call. Please try again.",
        duration: 3000,
      });
      cleanup();
    }
  };

  const handleRejectCall = async () => {
    try {
      await rejectCall(sessionId);
      setIncomingCall(false);
      stopRingtone();
      cleanup();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall(sessionId);
      cleanup();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const cleanup = async () => {
    stopRingtone();
    
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current.close();
      localTrackRef.current = null;
    }
    
    await client.leave();
    
    setIsCallActive(false);
    setCallStatus('ended');
    setIncomingCall(false);
    setCallerId(null);
  };

  const toggleMute = () => {
    if (localTrackRef.current) {
      if (isMuted) {
        localTrackRef.current.setEnabled(true);
      } else {
        localTrackRef.current.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  // Initialize Pusher and handle real-time events for call signaling
  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`voice.${userId}`);

    // Handle incoming call
    channel.bind('voice.initiated', (data: { 
      sessionId: string | number, 
      data: { 
        from: number,
        name: string 
      } 
    }) => {
      if (Number(data.sessionId) === Number(sessionId)) {
        setCallerId(data.data.from);
        setCallerName(data.data.name);
        setIncomingCall(true);
        setCallStatus('ringing');
        startRinging();
        toast({
          title: "📞 Incoming Call",
          description: `${data.data.name} is calling you...`,
          duration: 30000,
          variant: "default",
        });
      }
    });

    // Handle call ended
    channel.bind('voice.ended', (data: { sessionId: string | number }) => {
      if (Number(data.sessionId) === Number(sessionId)) {
        toast({
          title: "📞 Call Ended",
          description: "The call has been ended",
          duration: 3000,
        });
        cleanup();
      }
    });

    // Handle call rejected
    channel.bind('voice.rejected', (data: { sessionId: string | number }) => {
      if (Number(data.sessionId) === Number(sessionId)) {
        toast({
          title: "❌ Call Rejected",
          description: `${userName} rejected the call`,
          duration: 3000,
        });
        cleanup();
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`voice.${userId}`);
      cleanup();
    };
  }, [sessionId, userId]);

  return (
    <>
      <Dialog open={incomingCall} onOpenChange={(open) => !open && handleRejectCall()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-2" />
              📞 Incoming Call
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              {callerName || userName} is calling you...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 py-4">
            <Button 
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 px-6 py-4 text-lg"
            >
              <Phone className="h-5 w-5 mr-2" />
              Accept
            </Button>
            <Button 
              onClick={handleRejectCall}
              variant="destructive"
              className="px-6 py-4 text-lg"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        {!isCallActive ? (
          <Button
            onClick={startCall}
            variant="outline"
            size="icon"
            className="rounded-full bg-green-500 hover:bg-green-600"
          >
            <Phone className="h-4 w-4 text-white" />
          </Button>
        ) : (
          <>
            <Button
              onClick={handleEndCall}
              variant="outline"
              size="icon"
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-4 w-4 text-white" />
            </Button>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isMuted ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-4 w-4 text-white" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* Call Status Indicator */}
      {callStatus !== 'idle' && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 ${
          callStatus === 'connected' ? 'bg-green-500' :
          callStatus === 'connecting' ? 'bg-yellow-500' :
          callStatus === 'ringing' ? 'bg-blue-500' : 'bg-red-500'
        } text-white`}>
          <div className={`w-2 h-2 rounded-full ${
            callStatus === 'connected' ? 'animate-pulse bg-white' :
            callStatus === 'connecting' ? 'animate-spin bg-white' :
            callStatus === 'ringing' ? 'animate-ping bg-white' : 'bg-white'
          }`} />
          <span>
            {callStatus === 'connected' ? '✅ Call in progress' :
             callStatus === 'connecting' ? '🔄 Connecting...' :
             callStatus === 'ringing' ? '📞 Ringing...' : '❌ Call ended'}
          </span>
        </div>
      )}
    </>
  );
} 