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
use Firebase\JWT\JWT;

class VoiceCallController extends Controller
{
    private $appID;
    private $serverSecret;

    public function __construct()
    {
        $this->appID = env('ZEGOCLOUD_APP_ID');
        $this->serverSecret = env('ZEGOCLOUD_SERVER_SECRET');
    }

    private function generateToken($userID, $userName, $roomID, $seconds = 3600)
    {
        $payload = [
            'app_id' => intval($this->appID),
            'user_id' => strval($userID),
            'room_id' => strval($roomID),
            'privileges' => [
                'can_publish' => true,
                'can_subscribe' => true
            ],
            'stream_id_list' => null,
            'iat' => time(),
            'exp' => time() + $seconds
        ];

        return JWT::encode($payload, strval($this->serverSecret), 'HS256');
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

        // Generate room ID (using session ID)
        $roomId = "session_" . $sessionId;

        // Generate ZEGOCLOUD token for caller
        $callerToken = $this->generateToken(
            (string)$callerId,
            "User_" . $callerId,
            $roomId
        );

        $callData = [
            'session_id' => $sessionId,
            'caller_id' => $callerId,
            'receiver_id' => $receiverId,
            'room_id' => $roomId,
            'token' => $callerToken,
            'app_id' => $this->appID
        ];

        event(new IncomingCall($callData));

        return response()->json([
            'message' => 'Call initiated',
            'room_id' => $roomId,
            'token' => $callerToken,
            'app_id' => $this->appID
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

        // Generate room ID
        $roomId = "session_" . $sessionId;

        // Generate ZEGOCLOUD token for receiver
        $receiverToken = $this->generateToken(
            (string)$receiverId,
            "User_" . $receiverId,
            $roomId
        );

        $zegoData = [
            'room_id' => $roomId,
            'token' => $receiverToken,
            'app_id' => $this->appID
        ];

        event(new CallAnswered($callerId, $session, $receiverId, $zegoData));

        return response()->json([
            'message' => 'Call accepted',
            'room_id' => $roomId,
            'token' => $receiverToken,
            'app_id' => $this->appID
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