import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, X as Cross, HandIcon as PrayingHands } from "lucide-react"
import { format } from "date-fns"
import { ChatSession, Message } from "@/lib/types"
import { motion } from "framer-motion"

interface ChatInfoPanelProps {
  onClose: () => void;
  session: ChatSession;
  messages: Message[];
}

export function ChatInfoPanel({ onClose, session, messages }: ChatInfoPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-0 right-0 h-full w-80 bg-card border-l shadow-lg"
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Session Information</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Cross className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center space-y-3 pb-4 border-b">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={`/images/categories/${session?.category?.icon}`} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {session?.category?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h4 className="font-semibold text-lg">{session?.category?.name}</h4>
            <p className="text-sm text-muted-foreground">{session?.category?.description}</p>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Session Details</h4>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Started: {format(new Date(session.created_at), "MMMM d, yyyy")}</span>
          </div>

          {session.accepted_at && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Accepted: {format(new Date(session.accepted_at), "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          )}

          {session.closed_at && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Closed: {format(new Date(session.closed_at), "MMMM d, yyyy 'at' h:mm a")}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Initial Message</h4>
          <p className="text-sm text-muted-foreground">
            {session.initial_message}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Category Information</h4>
          <p className="text-sm text-muted-foreground">
            {session?.category?.description}
          </p>
        </div>

        {session.status === 'active' && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <PrayingHands className="h-4 w-4 mr-2" />
                Request Prayer
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 