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

class CallRejected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $session;
    public $receiverId;

    public function __construct($userId, ChatSession $session, $receiverId)
    {
        $this->userId = $userId;
        $this->session = $session;
        $this->receiverId = $receiverId;
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
        return 'call.rejected';
    }

    public function broadcastWith()
    {
        return [
            'session' => [
                'id' => $this->session->id
            ],
            'user_id' => $this->userId,
            'receiver_id' => $this->receiverId
        ];
    }
} 