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

class CallAnswered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public $userId;
    public $session;
    public $receiverId;
    public $agoraData;

    public function __construct($userId, ChatSession $session, $receiverId, $agoraData = null)
    {
        $this->userId = $userId;
        $this->session = $session;
        $this->receiverId = $receiverId;
        $this->agoraData = $agoraData;
    }

    public function broadcastOn()
    {
        return [
            new Channel('user.' . $this->userId),
            new Channel('user.' . $this->receiverId),
        ];
    }

    public function broadcastAs()
    {
        return 'call.answered';
    }
} 