import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import {  endCall, rejectCall, initiateCall } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCallProps {
  sessionId: number;
  isActive: boolean;
  onCallEnd: () => void;
  isIncoming?: boolean;
  userName?: string;
}

type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '';

export function VoiceCall({ sessionId, isActive, onCallEnd, isIncoming = false, userName = 'User' }: VoiceCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream] = useState<MediaStream>(new MediaStream());
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const peerConnection = useRef<RTCPeerConnection | null>(null);
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

  useEffect(() => {
    if (isActive) {
      if (isIncoming) {
        setCallStatus('ringing');
        // Play ringtone for incoming call
        ringToneRef.current?.play().catch(console.error);
      } else {
        startCall();
      }
    }
    return () => {
      cleanup();
    };
  }, [isActive, isIncoming]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      await initiateCall(sessionId);
      await initializeCall();
      
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
      onCallEnd();
    }
  };

  const initializeCall = async () => {
    try {
      // Initialize WebRTC
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
      };

      // Initialize Pusher with authentication
      pusherClient.current = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
        auth: {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          },
        },
      });

      const channel = pusherClient.current.subscribe(`presence-call-channel-${sessionId}`);

      // Handle subscription success
      channel.bind('pusher:subscription_succeeded', (members: any) => {
        console.log('Successfully subscribed to presence channel', members);
        setCallStatus('connected');
      });

      // Handle subscription error
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('Presence channel subscription error:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Failed to establish call connection. Please try again.",
        });
        handleCallEnded("Connection failed");
      });

      // Handle member changes
      channel.bind('pusher:member_added', (member: any) => {
        console.log('Member joined:', member);
      });

      channel.bind('pusher:member_removed', (member: any) => {
        console.log('Member left:', member);
        handleCallEnded("The other participant left the call");
      });

      // Handle incoming offer
      channel.bind('offer', async (data: { offer: RTCSessionDescriptionInit }) => {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          // await sendCallAnswer(sessionId, answer);
          setCallStatus('connected');
          stopRingtone();
        }
      });

      // Handle incoming answer
      channel.bind('answer', async (data: { answer: RTCSessionDescriptionInit }) => {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallStatus('connected');
          stopRingtone();
        }
      });

      // Handle call rejected
      channel.bind('call-rejected', () => {
        handleCallEnded("Call was rejected");
      });

      // Handle ICE candidates
      channel.bind('ice-candidate', async (data: { candidate: RTCIceCandidateInit }) => {
        if (data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

      // Handle call end
      channel.bind('call-ended', () => {
        handleCallEnded("Call ended");
      });

      // Send ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          // await sendIceCandidate(sessionId, event.candidate);
        }
      };

      peerConnection.current = pc;

      // If not incoming call, create and send offer
      if (!isIncoming) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // await sendCallOffer(sessionId, offer);
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      handleCallEnded("Failed to initialize call");
    }
  };

  const handleAcceptCall = async () => {
    stopRingtone();
    await initializeCall();
  };

  const handleRejectCall = async () => {
    stopRingtone();
    await rejectCall(sessionId);
    cleanup();
    onCallEnd();
  };

  const handleCallEnded = (message: string) => {
    toast({
      title: "Call Ended",
      description: message,
      duration: 3000,
    });
    stopRingtone();
    cleanup();
    onCallEnd();
  };

  const stopRingtone = () => {
    if (ringToneRef.current) {
      ringToneRef.current.pause();
      ringToneRef.current.currentTime = 0;
    }
  };

  const cleanup = () => {
    stopRingtone();

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (pusherClient.current) {
      pusherClient.current.unsubscribe(`presence-call-channel-${sessionId}`);
      pusherClient.current.disconnect();
      pusherClient.current = null;
    }

    setCallStatus('ended');
  };

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline />
      
      <Dialog open={callStatus === 'ringing'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isIncoming ? 'Incoming Call' : 'Calling...'}</DialogTitle>
            <DialogDescription>
              {isIncoming ? `${userName} is calling...` : `Calling ${userName}...`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 py-4">
            {isIncoming ? (
              <>
                <Button 
                  onClick={handleAcceptCall}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Accept
                </Button>
                <Button 
                  onClick={handleRejectCall}
                  variant="destructive"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  Reject
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleRejectCall}
                variant="destructive"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {callStatus === 'connected' && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Call in progress</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 hover:bg-primary-foreground/10"
            onClick={() => endCall(sessionId)}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
} 