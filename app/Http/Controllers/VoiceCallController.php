<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Carbon\Carbon;
use App\Events\IncomingCall;
use App\Events\CallAnswered;
use App\Events\CallRejected;
use App\Events\CallEnded;
use App\Helpers\Agora\RtcTokenBuilder2;

class VoiceCallController extends Controller
{
    private function generateAgoraToken($channelName, $uid)
    {
        $appId = env('AGORA_APP_ID');
        $appCertificate = env('AGORA_APP_CERTIFICATE');
        $expireTimestamp = now()->timestamp + 3600; // 1 hour
        
        $token = RtcTokenBuilder2::buildTokenWithUid(
            $appId,
            $appCertificate,
            $channelName,
            $uid,
            RtcTokenBuilder2::ROLE_PUBLISHER,
            $expireTimestamp
        );

        return $token;
    }

    public function initiateCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        // Verify user is part of the chat session
        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Determine caller and receiver IDs
        $callerId = Auth::id();
        $receiverId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;

        // Generate Agora token
        $channelName = "chat_session_{$sessionId}";
        $token = $this->generateAgoraToken($channelName, $callerId);

        $callData = [
            'session_id' => $sessionId,
            'caller_id' => $callerId,
            'receiver_id' => $receiverId,
            'timestamp' => now(),
            'channel_name' => $channelName,
            'token' => $token
        ];

        event(new IncomingCall($callData));

        return response()->json([
            'message' => 'Call initiated',
            'channel_name' => $channelName,
            'token' => $token
        ]);
    }

    public function acceptCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Determine caller and receiver IDs
        $callerId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;
        $receiverId = Auth::id();

        // Generate channel name using session ID
        $channelName = "chat_session_{$sessionId}";
        
        // Generate tokens for both users
        $callerToken = $this->generateAgoraToken($channelName, $callerId);
        $receiverToken = $this->generateAgoraToken($channelName, $receiverId);

        // Broadcast call answered event with tokens
        event(new CallAnswered($callerId, $session, $receiverId, [
            'channel_name' => $channelName,
            'token' => $receiverToken
        ]));

        return response()->json([
            'message' => 'Call accepted',
            'channel_name' => $channelName,
            'token' => $receiverToken
        ]);
    }

    public function rejectCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $callerId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;
        $receiverId = Auth::id();

        event(new CallRejected($callerId, $session, $receiverId));

        return response()->json(['message' => 'Call rejected']);
    }

    public function endCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $callerId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;
        $receiverId = Auth::id();
        
        event(new CallEnded($callerId, $session, $receiverId));

        return response()->json(['message' => 'Call ended']);
    }
} 