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
    
    public $callerID;
    public $session;
    public $receiverId;
    public $zegoData;

    public function __construct($callerID, ChatSession $session, $receiverId, $zegoData)
    {
        $this->callerID = $callerID;
        $this->session = $session;
        $this->receiverId = $receiverId;
        $this->zegoData = $zegoData;
    }

    public function broadcastOn()
    {
        return [
            new Channel('user.' . $this->callerID),
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
            ],
            'caller_id' => $this->callerID,
            'receiver_id' => $this->receiverId,
            'room_id' => $this->zegoData['room_id'],
            'token' => $this->zegoData['token'],
            'app_id' => $this->zegoData['app_id']
        ];
    }
} 