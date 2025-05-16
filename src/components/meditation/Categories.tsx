"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Calendar,
  MessageCircle,
  BookOpen,
  HandIcon as PrayingHands,
  Heart,
  Users,
  Sparkles,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react"
import { createChatSession } from "@/lib/api"

// Mock data for categories
const categories = [
  {
    id: 1,
    title: "Personal Spiritual Guidance",
    description: "One-on-one spiritual direction and guidance for your faith journey",
    image: "/placeholder.svg?height=200&width=300&text=Spiritual+Guidance",
    icon: <User className="h-5 w-5" />,
    color: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    available: true,
    waitTime: "~5 minutes",
  },
  {
    id: 2,
    title: "Prayer Requests",
    description: "Submit your prayer intentions to be included in daily prayers",
    image: "/placeholder.svg?height=200&width=300&text=Prayer+Requests",
    icon: <PrayingHands className="h-5 w-5" />,
    color: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    available: true,
    waitTime: "~10 minutes",
  },
  {
    id: 3,
    title: "Scripture Reflection",
    description: "Guided reflection on scripture passages and their meaning in daily life",
    image: "/placeholder.svg?height=200&width=300&text=Scripture+Reflection",
    icon: <BookOpen className="h-5 w-5" />,
    color: "bg-amber-50 dark:bg-amber-950",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    available: true,
    waitTime: "~15 minutes",
  },
  {
    id: 4,
    title: "Confession Preparation",
    description: "Guidance and preparation for the Sacrament of Reconciliation",
    image: "/placeholder.svg?height=200&width=300&text=Confession+Preparation",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-red-50 dark:bg-red-950",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    available: false,
    waitTime: "Unavailable",
  },
  {
    id: 5,
    title: "Faith Formation",
    description: "Learn more about Catholic teachings and deepen your understanding",
    image: "/placeholder.svg?height=200&width=300&text=Faith+Formation",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-green-50 dark:bg-green-950",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    available: true,
    waitTime: "~20 minutes",
  },
  {
    id: 6,
    title: "Community Support",
    description: "Connect with others in the faith community for mutual support",
    image: "/placeholder.svg?height=200&width=300&text=Community+Support",
    icon: <Users className="h-5 w-5" />,
    color: "bg-teal-50 dark:bg-teal-950",
    textColor: "text-teal-700 dark:text-teal-300",
    borderColor: "border-teal-200 dark:border-teal-800",
    available: true,
    waitTime: "~10 minutes",
  },
]

export function Categories() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [activeSession, setActiveSession] = useState<any>(null)

  const handleCategorySelect = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category?.available) return
    setSelectedCategory(categoryId)
    setMessage("")
  }

  const handleSubmit = async () => {
    if (!selectedCategory || !message.trim()) return
    setIsLoading(true)
    try {
      const response = await createChatSession(selectedCategory, message)
      router.push(`/meditation/chat/${response.id}`)
    } catch (error: any) {
      console.error("Failed to create chat session:", error)

      // Check if the error is due to an active session
      if (error.response?.data?.message?.includes("active chat session") && error.response?.data?.session) {
        setActiveSession(error.response.data.session)
        setErrorDialogOpen(true)

        // Also show a toast notification
        toast({
          variant: "destructive",
          title: "Active Session Exists",
          description: "You already have an active chat session. Please close it before starting a new one.",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/meditation/chat/${error.response.data.session.id}`)}
            >
              Go to Session
            </Button>
          ),
        })
      } else {
        // For other errors, just show a toast
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to create chat session. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToActiveSession = () => {
    if (activeSession) {
      router.push(`/meditation/chat/${activeSession.id}`)
    }
    setErrorDialogOpen(false)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <>
      <div className="py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={item}>
              <Card
                className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  !category.available ? "opacity-70" : "hover:scale-[1.02]"
                } ${category.borderColor} border-2`}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div
                    className={`absolute top-0 right-0 m-2 ${
                      category.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    } px-2 py-1 rounded-full text-xs font-medium`}
                  >
                    {category.available ? "Available Now" : "Currently Unavailable"}
                  </div>
                </div>
                <CardHeader className={`${category.color}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${category.textColor} bg-white dark:bg-gray-800`}>
                      {category.icon}
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-base mb-4">{category.description}</CardDescription>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Available 24/7</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>Estimated wait: {category.waitTime}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={!category.available}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    Start Conversation
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Message Input Dialog */}
      <Dialog open={selectedCategory !== null} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start a Conversation</DialogTitle>
            <DialogDescription>
              Share your thoughts or questions with a Reverend Father. They will respond as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
              disabled={isLoading}
            />
            <Button onClick={handleSubmit} className="w-full" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>Send Message</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Session Error Dialog */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-100 dark:bg-red-900 rounded-full p-3 border-4 border-background">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
            </div>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">Active Session Exists</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You already have an active chat session. Please continue your existing conversation or close it before
              starting a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Session #{activeSession?.id}</span>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">
                {activeSession?.status}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">Category:</span>{" "}
              {categories.find((c) => c.id === activeSession?.category_id)?.title || "Unknown"}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Started:</span>{" "}
              {activeSession?.created_at ? new Date(activeSession.created_at).toLocaleString() : "Unknown"}
            </div>
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0 sm:mt-0">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={navigateToActiveSession} className="bg-primary hover:bg-primary/90">
              Continue Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
