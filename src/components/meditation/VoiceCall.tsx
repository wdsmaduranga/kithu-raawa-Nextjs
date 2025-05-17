import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { sendCallOffer, sendCallAnswer, sendIceCandidate, endCall, rejectCall, initiateCall } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCallProps {
  sessionId: number;
  userId: number;
  userName?: string;
}

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export function VoiceCall({ sessionId, userId, userName = 'User' }: VoiceCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerId, setCallerId] = useState<number | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream>(new MediaStream());
  const audioRef = useRef<HTMLAudioElement>(null);
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
    // Start ringtone
    ringToneRef.current?.play().catch(console.error);
    
    // Vibrate if supported (mobile devices)
    if (navigator.vibrate) {
      const vibratePattern: number[] = [500, 200, 500, 200, 500];
      navigator.vibrate(vibratePattern);
    }

    // Auto-stop ringing after 30 seconds if call not answered
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
    // Stop vibration
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
    // Clear auto-stop timeout
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
    }
  };

  const initializePeerConnection = async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    // Add connection state monitoring
    peerConnection.current.onconnectionstatechange = () => {
      if (peerConnection.current) {
        switch(peerConnection.current.connectionState) {
          case "disconnected":
            toast({
              title: "Connection Issue",
              description: "Call quality may be affected. Trying to reconnect...",
              duration: 5000,
            });
            break;
          case "failed":
            toast({
              variant: "destructive",
              title: "Connection Lost",
              description: "Call ended due to connection failure",
              duration: 3000,
            });
            cleanup();
            break;
          case "connected":
            toast({
              title: "Connected",
              description: "Call quality is stable",
              duration: 3000,
            });
            break;
        }
      }
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await sendIceCandidate(sessionId, event.candidate);
        } catch (error) {
          console.error('Error sending ICE candidate:', error);
        }
      }
    };

    // Handle incoming tracks
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.current.addTrack(track);
      });
      if (audioRef.current) {
        audioRef.current.srcObject = remoteStream.current;
      }
    };

    // Get local stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      localStream.current = stream;
      stream.getTracks().forEach((track) => {
        if (peerConnection.current) {
          peerConnection.current.addTrack(track, stream);
        }
      });
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access your microphone. Please check your permissions.",
      });
      throw err;
    }
  };

  const startCall = async () => {
    try {
      await initializePeerConnection();
      await initiateCall(sessionId);
      
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      
      if (offer) {
        await sendCallOffer(sessionId, offer);
      }
      
      setIsCallActive(true);
      setCallStatus('connecting');
      
      toast({
        title: "Calling...",
        description: `Calling ${userName}`,
        duration: 3000,
      });

      // Play ringtone for outgoing call
      ringToneRef.current?.play().catch(console.error);
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
      await initializePeerConnection();
      setIncomingCall(false);
      setIsCallActive(true);
      setCallStatus('connecting');
      stopRingtone();

      // Create and send answer
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      
      if (answer) {
        await sendCallAnswer(sessionId, answer);
        setCallStatus('connected');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        variant: "destructive",
        title: "Call Failed",
        description: "Could not accept the call. Please try again.",
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

  const cleanup = () => {
    stopRingtone();
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setIsCallActive(false);
    setCallStatus('ended');
    setIncomingCall(false);
    setCallerId(null);
  };

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Initialize Pusher and handle real-time events
  useEffect(() => {
    Pusher.logToConsole = false;
    if (!userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${userId}`);

    // Handle incoming call
    channel.bind('voice.initiated', (data: { sessionId: number, data: { from: number } }) => {
      if (data.sessionId === sessionId) {
        setCallerId(data.data.from);
        setIncomingCall(true);
        setCallStatus('ringing');
        startRinging();
      }
    });

    // Handle call offer
    channel.bind('voice.offer', async (data: { sessionId: number, data: { offer: RTCSessionDescriptionInit } }) => {
      if (data.sessionId === sessionId && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.data.offer));
      }
    });

    // Handle call answer
    channel.bind('voice.answer', async (data: { sessionId: number, data: { answer: RTCSessionDescriptionInit } }) => {
      if (data.sessionId === sessionId && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.data.answer));
        setCallStatus('connected');
        stopRingtone();
      }
    });

    // Handle ICE candidates
    channel.bind('voice.ice-candidate', async (data: { sessionId: number, data: { candidate: RTCIceCandidateInit } }) => {
      if (data.sessionId === sessionId && peerConnection.current && data.data.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.data.candidate));
      }
    });

    // Handle call ended
    channel.bind('voice.ended', (data: { sessionId: number }) => {
      if (data.sessionId === sessionId) {
        toast({
          title: "Call Ended",
          description: "The other participant ended the call",
          duration: 3000,
        });
        cleanup();
      }
    });

    // Handle call rejected
    channel.bind('voice.rejected', (data: { sessionId: number }) => {
      if (data.sessionId === sessionId) {
        toast({
          title: "Call Rejected",
          description: "The other participant rejected the call",
          duration: 3000,
        });
        cleanup();
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user.${userId}`);
      cleanup();
    };
  }, [sessionId, userId]);

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline />
      
      <Dialog open={incomingCall} onOpenChange={(open) => !open && handleRejectCall()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-2" />
              Incoming Call
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              {userName} is calling you...
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

      {callStatus === 'connected' && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Call in progress</span>
        </div>
      )}
    </>
  );
} 