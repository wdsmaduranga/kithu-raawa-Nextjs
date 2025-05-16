import { format } from "date-fns"
import {
  Calendar,
  Clock,
  CheckCheck,
  XCircle,
  FileText,
  BookOpen,
  HandIcon as PrayingHands,
  User,
  Heart,
  Cross,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ChatSession } from "@/lib/types"

interface ReverendInfoPanelProps {
  session: ChatSession
  onClose: () => void
  onCloseSession: () => void
}

export function ReverendInfoPanel({ session, onClose, onCloseSession }: ReverendInfoPanelProps) {
  const getCategoryIcon = (categoryName?: string) => {
    switch (categoryName) {
      case "Personal Spiritual Guidance":
        return <User className="h-5 w-5" />
      case "Prayer Requests":
        return <PrayingHands className="h-5 w-5" />
      case "Scripture Reflection":
        return <BookOpen className="h-5 w-5" />
      case "Confession Preparation":
        return <Heart className="h-5 w-5" />
      default:
        return <Cross className="h-5 w-5" />
    }
  }

  return (
    <div className="hidden lg:block border-l bg-background w-80 flex-shrink-0 h-full overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold">Session Information</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center space-y-3 pb-4 border-b">
          <div className="p-3 rounded-full bg-primary/10">{getCategoryIcon(session.category?.name)}</div>
          <div className="text-center">
            <h4 className="font-semibold">{session.category?.name || "General Guidance"}</h4>
            <Badge variant="outline" className="mt-1">
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">User Information</h4>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session.user?.avatar_url} />
              <AvatarFallback>{session.user?.first_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session.user?.first_name || "Anonymous User"}</p>
              <p className="text-xs text-muted-foreground">User ID: {session.user_id}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Session Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created: {format(new Date(session.created_at), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Time: {format(new Date(session.created_at), "h:mm a")}</span>
            </div>
            {session.accepted_at && (
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-muted-foreground" />
                <span>Accepted: {format(new Date(session.accepted_at), "MMMM d, h:mm a")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View Transcript
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <PrayingHands className="h-4 w-4 mr-2" />
              Send Prayer
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Share Scripture
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Session</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to close this session? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive" onClick={onCloseSession}>
                    Close Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}