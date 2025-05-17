"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import type { Message } from "@/lib/types";
import { markMessageAsDelivered } from "@/lib/api";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) return;

    Pusher.logToConsole = true;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user.id}`);

    // Listen for new messages
    channel.bind(`message.new`, async (data: { message: Message }) => {
      // Mark message as delivered if it's for current user
      if (data.message.receiver_id === user.id) {
        try {
          await markMessageAsDelivered(data.message.id);
        } catch (error) {
          console.error("Failed to mark message as delivered:", error);
        }
      }

      // Only show notification if we're not in the chat page
      // if (!window.location.pathname.includes('/reverend/chat')) {
        const senderName = data.message.sender?.first_name || "Someone";
        const messagePreview = data.message.message.length > 50 
          ? data.message.message.substring(0, 50) + "..."
          : data.message.message;

        toast({
          title: `New Message from ${senderName}`,
          description: messagePreview,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push(`/admin/reverend/chat?id=${data.message.chat_session_id}`);
              }}
            >
              View Chat
            </Button>
          ),
        });
      // }
    });

    // Listen for message status updates
    channel.bind(`message.status`, (data: {
      messageId: number;
      status: "sent" | "delivered" | "seen";
      delivered_at: string | null;
      seen_at: string | null;
    }) => {
      // You can handle status updates here if needed
      // For example, show a notification when important messages are delivered
      if (data.status === "delivered") {
        // Handle delivery status
        console.log("Message delivered:", data.messageId);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user.${user.id}`);
    };
  }, [user, router, toast]);

  return <>{children}</>;
} 