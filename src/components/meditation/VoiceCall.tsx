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
  const [callerName, setCallerName] = useState<string>('');
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream>(new MediaStream());
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringToneRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { toast } = useToast();
  const [pendingOffer, setPendingOffer] = useState<RTCSessionDescriptionInit | null>(null);

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
      console.log('Accepting call, initializing connection...');
      await initializePeerConnection();
      
      if (!peerConnection.current) {
        throw new Error('Failed to create peer connection');
      }

      if (!pendingOffer) {
        console.error('No pending offer available');
        throw new Error('No offer available');
      }

      console.log('Setting remote description from stored offer...');
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(pendingOffer));

      console.log('Creating answer...');
      const answer = await peerConnection.current.createAnswer();
      
      console.log('Setting local description...', answer);
      await peerConnection.current.setLocalDescription(answer);

      console.log('Sending answer to peer...');
      await sendCallAnswer(sessionId, answer);
      
      setIncomingCall(false);
      setIsCallActive(true);
      setCallStatus('connected');
      stopRingtone();
      
      toast({
        title: "✅ Connected",
        description: "Call connection established",
        duration: 3000,
      });
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

  // Handle remote offer when received
  const handleRemoteOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnection.current) {
        console.error('No peer connection available');
        return;
      }
      
      console.log('Setting remote description from offer...');
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer immediately after setting remote description
      console.log('Creating answer after remote offer...');
      const answer = await peerConnection.current.createAnswer();
      console.log('Setting local description...', answer);
      await peerConnection.current.setLocalDescription(answer);
      
      if (answer) {
        console.log('Sending answer...');
        await sendCallAnswer(sessionId, answer);
        setCallStatus('connected');
      }
    } catch (error) {
      console.error('Error handling remote offer:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to process call offer. Please try again.",
        duration: 3000,
      });
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
    setPendingOffer(null);
    
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
    Pusher.logToConsole = true;
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
      console.log('Incoming call received:', data);
  
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

    // Handle call offer
    channel.bind('voice.offer', async (data: { 
      sessionId: string | number, 
      data: { 
        from: number,
        name: string,
        offer: RTCSessionDescriptionInit 
      } 
    }) => {
      console.log('Call offer received:', data);
      
      if (Number(data.sessionId) === Number(sessionId)) {
        console.log('Storing offer for later use');
        setPendingOffer(data.data.offer);
        setCallerName(data.data.name);
      }
    });

    // Handle ICE candidates
    channel.bind('voice.ice-candidate', async (data: { sessionId: number, data: { candidate: RTCIceCandidateInit } }) => {
      console.log('ICE candidate received:', data);
      if (data.sessionId === sessionId && peerConnection.current && data.data.candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.data.candidate));
          console.log('ICE candidate added successfully');
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Handle call answer
    channel.bind('voice.answer', async (data: { 
      sessionId: string | number, 
      data: { 
        answer: RTCSessionDescriptionInit,
        name: string 
      } 
    }) => {
      console.log('Call answer received:', data);
      if (Number(data.sessionId) === Number(sessionId) && peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.data.answer));
          setCallStatus('connected');
          stopRingtone();
          toast({
            title: "✅ Call Connected",
            description: "You are now connected with " + userName,
            duration: 3000,
          });
        } catch (error) {
          console.error('Error setting remote description for answer:', error);
          setCallStatus('ended');
          toast({
            variant: "destructive",
            title: "❌ Connection Error",
            description: "Failed to connect the call. Please try again.",
            duration: 5000,
          });
        }
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
      <audio ref={audioRef} autoPlay playsInline />
      
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