import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack 
} from 'agora-rtc-sdk-ng';

let client: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;

export const initializeAgoraClient = () => {
  if (!client) {
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }
  return client;
};

export const joinChannel = async (
  appId: string,
  channel: string,
  token: string,
  uid: number
) => {
  if (!client) {
    client = initializeAgoraClient();
  }

  try {
    // Join the channel
    await client.join(appId, channel, token, uid);

    // Create and publish local audio track
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([localAudioTrack]);

    return { client, localAudioTrack };
  } catch (error) {
    console.error('Error joining channel:', error);
    throw error;
  }
};

export const leaveChannel = async () => {
  if (localAudioTrack) {
    localAudioTrack.close();
    localAudioTrack = null;
  }

  if (client) {
    await client.leave();
    client = null;
  }
};

export const handleUserPublished = (
  user: IAgoraRTCRemoteUser,
  mediaType: 'audio' | 'video'
) => {
  if (client) {
    client.subscribe(user, mediaType);
  }
};

export const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
  if (client) {
    client.unsubscribe(user);
  }
}; 