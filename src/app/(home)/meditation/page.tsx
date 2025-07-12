'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Categories } from "@/components/meditation/Categories"
import { OngoingChats } from "@/components/meditation/OngoingChats"
import { HandIcon as PrayingHands, Heart, BookOpen, MessageCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserStore } from "@/stores/userStore"

export default function MeditationPage() {
  const [mounted, setMounted] = useState(false)
  const { user, fetchUser } = useUserStore()

  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
}, [user, fetchUser]);
  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 blur"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-full p-4">
                <PrayingHands className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">
            Spiritual Guidance & Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect with Reverend Fathers for spiritual guidance, prayer requests, and personal counseling in a private
            and secure environment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compassionate Guidance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receive understanding and empathetic spiritual direction for life's challenges and questions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <PrayingHands className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prayer Support</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share your prayer intentions and receive spiritual support from our dedicated prayer community.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Faith Formation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Deepen your understanding of Catholic teachings and grow in your spiritual journey.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {user ?(< Tabs defaultValue="ongoing" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="ongoing" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Your Conversations</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Start New</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="ongoing" className="mt-0">
              <OngoingChats />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
                Select a Guidance Category
              </h2>
              <Categories />
            </TabsContent>
          </Tabs>) :'Logging Card'}
        </motion.div>
      </div>
    </div>
  )
}