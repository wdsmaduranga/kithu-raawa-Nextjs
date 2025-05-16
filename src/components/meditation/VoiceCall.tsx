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
}

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '';

export function VoiceCall({ sessionId, userId }: VoiceCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const pusherClient = useRef<Pusher | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Create audio elements for ringtones
  useEffect(() => {
    ringToneRef.current = new Audio('/sounds/ringtone.mp3');
    ringToneRef.current.loop = true;
    
    return () => {
      if (ringToneRef.current) {
        ringToneRef.current.pause();
        ringToneRef.current = null;
      }
    };
  }, []);

  const stopRingtone = () => {
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
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
      if (audioRef.current) {
        audioRef.current.srcObject = event.streams[0];
      }
    };

    // Get local stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        description: "Initiating voice call",
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
      endCall(sessionId);
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
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (pusherClient.current) {
      pusherClient.current.unsubscribe(`presence-call-${sessionId}`);
      pusherClient.current.disconnect();
      pusherClient.current = null;
    }
    
    setIsCallActive(false);
    setCallStatus('ended');
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
    pusherClient.current = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
    });

    const channel = pusherClient.current.subscribe(`presence-call-${sessionId}`);

    channel.bind('client-call-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
      if (peerConnection.current && !peerConnection.current.currentRemoteDescription) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallStatus('connected');
        stopRingtone();
      }
    });

    channel.bind('client-ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current && data.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    channel.bind('client-call-ended', () => {
      toast({
        title: "Call Ended",
        description: "The other participant ended the call",
        duration: 3000,
      });
      cleanup();
    });

    return () => {
      cleanup();
    };
  }, [sessionId]);

  return (
    <>
      <audio ref={audioRef} autoPlay />
      
      <Dialog open={callStatus === 'ringing'} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incoming Call</DialogTitle>
            <DialogDescription>
              Someone is calling you...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4">
            <Button onClick={startCall} className="bg-green-500 hover:bg-green-600">
              <Phone className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button onClick={handleEndCall} variant="destructive">
              <PhoneOff className="h-4 w-4 mr-2" />
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
    </>
  );
} 