import { Button } from "@/components/ui/button"
import { Phone, PhoneOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { acceptCall, rejectCall } from "@/lib/api"

interface CallNotificationProps {
  sessionId: number;
  callerName: string;
  onAccept: (channelName: string, token: string) => void;
  onReject: () => void;
}

export function CallNotification({ sessionId, callerName, onAccept, onReject }: CallNotificationProps) {
  useEffect(() => {
    // Play ringtone when notification appears
    const audio = new Audio('/sounds/ringtone.mp3'); // Make sure to add a ringtone file
    audio.loop = true;
    audio.play().catch(console.error);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const handleAccept = async () => {
    try {
      const response = await acceptCall(sessionId);
      onAccept(response.channel_name, response.token);
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast({
        variant: "destructive",
        title: "Failed to accept call",
        description: "Please try again or contact support if the problem persists.",
      });
    }
  };

  const handleReject = async () => {
    try {
      await rejectCall(sessionId);
      onReject();
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-background/95 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-5">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="font-semibold">Incoming Call</h3>
          <p className="text-sm text-muted-foreground">{callerName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="icon"
            className="bg-green-500 hover:bg-green-600"
            onClick={handleAccept}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleReject}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 