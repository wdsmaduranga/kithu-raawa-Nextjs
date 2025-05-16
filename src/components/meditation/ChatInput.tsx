import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PaperclipIcon, Send, Smile } from "lucide-react"
import { HandIcon as PrayingHands } from "lucide-react"
import { RefObject } from "react"

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  onSend: () => void;
  inputRef: RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
}

export function ChatInput({ newMessage, setNewMessage, onSend, inputRef, disabled }: ChatInputProps) {
  return (
    <div className="p-4 border-t bg-card">
      <div className="flex flex-col space-y-2">
        <Textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={disabled ? "Chat is not active..." : "Type your message..."}
          className="min-h-[80px] resize-none"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !disabled) {
              e.preventDefault()
              onSend()
            }
          }}
        />
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="text-muted-foreground" disabled={disabled}>
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-muted-foreground" disabled={disabled}>
              <Smile className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-muted-foreground" disabled={disabled}>
              <PrayingHands className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onSend} className="gap-2" disabled={disabled}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 