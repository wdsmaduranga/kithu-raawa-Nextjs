<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncomingCall implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return [
            new Channel('user.' . $this->data['receiver_id']),
        ];
    }

    public function broadcastAs()
    {
        return 'call.incoming';
    }

    public function broadcastWith()
    {
        return [
            'session_id' => $this->data['session_id'],
            'caller_id' => $this->data['caller_id'],
            'receiver_id' => $this->data['receiver_id'],
            'room_id' => $this->data['room_id'],
            'token' => $this->data['token'],
            'app_id' => $this->data['app_id']
        ];
    }
} 