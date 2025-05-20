<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ChatSession;
use Carbon\Carbon;

class CallAnswered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $callerId;
    public $session;
    public $receiverId;
    public $agoraData;

    public function __construct($callerId, ChatSession $session, $receiverId, $agoraData = null)
    {
        $this->callerId = $callerId;
        $this->session = $session;
        $this->receiverId = $receiverId;
        $this->agoraData = $agoraData;
    }

    public function broadcastOn()
    {
        return [
            new Channel('user.' . $this->callerId),
            new Channel('user.' . $this->receiverId),
        ];
    }

    public function broadcastAs()
    {
        return 'call.answered';
    }

    public function broadcastWith()
    {
        return [
            'session' => [
                'id' => $this->session->id,
                'status' => $this->session->status,
                'user_id' => $this->session->user_id,
                'reverend_id' => $this->session->reverend_id,
            ],
            'channel_name' => $this->agoraData['channel_name'] ?? null,
            'token' => $this->agoraData['token'] ?? null,
            'caller_id' => $this->callerId,
            'receiver_id' => $this->receiverId,
            'timestamp' => Carbon::now()->toIso8601String(),
        ];
    }
} 