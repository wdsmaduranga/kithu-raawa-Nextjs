<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Hmac\Sha256;
use Lcobucci\JWT\Signer\Key\InMemory;
use Carbon\Carbon;
use App\Events\IncomingCall;
use App\Events\CallAnswered;
use App\Events\CallRejected;
use App\Events\CallEnded;

class VoiceCallController extends Controller
{
    private function generateAgoraToken($channelName, $uid)
    {
        $appId = env('AGORA_APP_ID');
        $appCertificate = env('AGORA_APP_CERTIFICATE');
        $expireTimeInSeconds = 3600; // Token valid for 1 hour
        $currentTimestamp = Carbon::now()->timestamp;
        $privilegeExpiredTs = $currentTimestamp + $expireTimeInSeconds;

        $config = Configuration::forSymmetricSigner(
            new Sha256(),
            InMemory::plainText($appCertificate)
        );

        $token = $config->builder()
            ->withClaim('app_id', $appId)
            ->withClaim('channel_name', $channelName)
            ->withClaim('uid', $uid)
            ->withClaim('privilege_expired_ts', $privilegeExpiredTs)
            ->getToken($config->signer(), $config->signingKey());

        return $token->toString();
    }

    public function initiateCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        // Verify user is part of the chat session
        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Determine receiver ID
        $receiverId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;

        $callData = [
            'session_id' => $sessionId,
            'caller_id' => Auth::id(),
            'receiver_id' => $receiverId,
            'timestamp' => now(),
        ];

        event(new IncomingCall($callData));

        return response()->json(['message' => 'Call initiated']);
    }

    public function acceptCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $receiverId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;
        
        // Generate channel name using session ID
        $channelName = "call_" . $sessionId;
        
        // Generate tokens for both users
        $callerToken = $this->generateAgoraToken($channelName, $session->user_id);
        $receiverToken = $this->generateAgoraToken($channelName, $session->reverend_id);

        // Broadcast call answered event with tokens
        event(new CallAnswered(Auth::id(), $session, $receiverId, [
            'channel_name' => $channelName,
            'token' => Auth::id() === $session->user_id ? $callerToken : $receiverToken
        ]));

        return response()->json([
            'message' => 'Call accepted',
            'channel_name' => $channelName,
            'token' => Auth::id() === $session->user_id ? $callerToken : $receiverToken
        ]);
    }

    public function rejectCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $receiverId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;

        event(new CallRejected(Auth::id(), $session, $receiverId));

        return response()->json(['message' => 'Call rejected']);
    }

    public function endCall(Request $request, $sessionId)
    {
        $session = ChatSession::findOrFail($sessionId);

        if (Auth::id() !== $session->user_id && Auth::id() !== $session->reverend_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $receiverId = Auth::id() === $session->user_id ? $session->reverend_id : $session->user_id;
        
        event(new CallEnded(Auth::id(), $session, $receiverId));

        return response()->json(['message' => 'Call ended']);
    }
} 