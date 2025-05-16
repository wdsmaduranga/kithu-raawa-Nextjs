"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { getAllChatSessions } from "@/lib/api"
import type { ChatSession } from "@/lib/types"

export function OngoingChats() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const data = await getAllChatSessions()
        setSessions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [])

  // Auto-switch to categories tab when no sessions
  useEffect(() => {
    if (!isLoading && sessions.length === 0) {
      const categoriesTab = document.querySelector('[data-value="categories"]') as HTMLElement
      if (categoriesTab) {
        categoriesTab.click()
      }
    }
  }, [isLoading, sessions.length])

  const getCategoryColor = (categoryId: number) => {
    const colors = {
      1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      2: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      3: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      4: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800",
      5: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800",
      6: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    }
    return colors[categoryId as keyof typeof colors] || colors[1]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="h-3 w-3 mr-1" /> Waiting
          </Badge>
        )
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <MessageCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )
      default:
        return null
    }
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Conversations</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Loading your spiritual guidance sessions...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-t-4 border-muted">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="p-3 bg-muted/20 border-t flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return null // Return null since we're auto-switching to categories tab
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Conversations</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Continue your spiritual guidance journey</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sessions.map((session) => (
          <motion.div key={session.id} variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card
              className="overflow-hidden h-full border-t-4 hover:shadow-lg transition-all duration-300 flex flex-col"
              style={{
                borderTopColor:
                  session.status === "active"
                    ? "var(--primary)"
                    : session.status === "waiting"
                      ? "var(--amber-500)"
                      : "var(--muted)",
              }}
            >
              <CardContent className="p-4 flex-grow">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/10 flex-shrink-0">
                    <AvatarImage
                      src={
                        session.reverend_id
                          ? "/placeholder.svg?height=100&width=100&text=RF"
                          : "/placeholder.svg?height=100&width=100&text=?"
                      }
                      alt="Reverend"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.reverend_id ? "RF" : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-medium text-sm truncate">
                        {session.reverend_id ? session.user?.first_name : "Awaiting Reverend"}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 h-5 ${getCategoryColor(session.category_id)}`}
                      >
                        {session.category?.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        · {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-1 italic">
                    "{session.initial_message}"
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card to-transparent"></div>
                </div>
              </CardContent>

              <CardFooter className="p-3 bg-muted/20 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center">
                  {session.status === "waiting" ? (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-amber-500" /> Awaiting response
                    </span>
                  ) : session.status === "active" ? (
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1 text-primary" /> Active conversation
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-muted-foreground" /> Completed
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={session.status === "active" ? "default" : "outline"}
                  onClick={() => router.push(`/meditation/chat/${session.id}`)}
                  disabled={session.status === "closed"}
                  className="h-8 px-3 gap-1 rounded-full"
                >
                  {session.status === "waiting" ? (
                    <>View</>
                  ) : session.status === "active" ? (
                    <>Continue</>
                  ) : (
                    <>Transcript</>
                  )}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
} 