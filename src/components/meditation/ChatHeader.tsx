import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeft, Info } from "lucide-react"
import { ChatSession, Message } from "@/lib/types"
import { VoiceCall } from "./VoiceCall"

interface ChatHeaderProps {
  session: ChatSession;
  latestMessage?: Message;
  onInfoClick: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({ session, latestMessage, onInfoClick, showBackButton = false }: ChatHeaderProps) {
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
    <div className="p-4 border-b flex items-center justify-between bg-muted/30">
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src={`/images/categories/${session?.category?.icon}`} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {session?.category?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{session?.category?.name}</h2>
          <Badge className={getStatusColor(session.status)}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {session.status === 'active' && (
          <VoiceCall sessionId={session.id} userId={session.user_id} />
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={onInfoClick}
              >
                <Info className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Session Information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 