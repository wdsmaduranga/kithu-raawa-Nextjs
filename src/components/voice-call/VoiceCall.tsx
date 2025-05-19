import { useEffect, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { CallNotification } from './CallNotification';
import { api, getCallToken } from '@/lib/api';

interface VoiceCallProps {
  sessionId: number;
  isCallActive: boolean;
  onEndCall: () => void;
  userName?: string;
}

const client: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export function VoiceCall({ sessionId, isCallActive, onEndCall, userName }: VoiceCallProps) {
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<any>(null);

  useEffect(() => {
    if (isCallActive) {
      startCall();
    }
    return () => {
      stopCall();
    };
  }, [isCallActive]);

  const startCall = async (channelName?: string, token?: string) => {
    try {
      let callToken, callChannel;
      
      if (channelName && token) {
        // Use provided token and channel for incoming calls
        callToken = token;
        callChannel = channelName;
      } else {
        // Get new token for outgoing calls
        const response = await getCallToken(sessionId);
        callToken = response.token;
        callChannel = response.channel_name;
      }

      // Join the channel
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        callChannel,
        callToken,
        null
      );

      // Create and publish local audio track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([audioTrack]);
      setLocalAudioTrack(audioTrack);

      // Handle remote user events
      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
        if (user.audioTrack) {
          user.audioTrack.stop();
        }
      });

    } catch (error) {
      console.error('Failed to start call:', error);
      onEndCall();
    }
  };

  const stopCall = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    await client.leave();
    setLocalAudioTrack(null);
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.setEnabled(true);
      } else {
        localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleAcceptCall = (channelName: string, token: string) => {
    setShowIncomingCall(false);
    setIncomingCallData(null);
    startCall(channelName, token);
  };

  const handleRejectCall = () => {
    setShowIncomingCall(false);
    setIncomingCallData(null);
  };

  return (
    <>
      {showIncomingCall && incomingCallData && (
        <CallNotification
          sessionId={sessionId}
          callerName={incomingCallData.callerName}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      {isCallActive && (
        <div className="fixed bottom-20 right-4 flex flex-col items-center gap-2 bg-background/95 p-4 rounded-lg shadow-lg border">
          <div className="text-sm font-medium">
            {userName ? `In call with ${userName}` : 'Call in progress'}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className={isMuted ? 'bg-destructive text-destructive-foreground' : ''}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onEndCall}
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
} 