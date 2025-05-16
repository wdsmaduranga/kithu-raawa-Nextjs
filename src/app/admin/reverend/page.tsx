'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Bell,
  Search,
  ChevronRight,
  User,
  BookOpen,
  HandIcon as PrayingHands,
  Heart,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { getChatSessions, acceptChatSession } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import Pusher from 'pusher-js';
import { ChatSession } from '@/lib/types';

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Personal Spiritual Guidance": <User className="h-5 w-5" />,
  "Prayer Requests": <PrayingHands className="h-5 w-5" />,
  "Scripture Reflection": <BookOpen className="h-5 w-5" />,
  "Confession Preparation": <Heart className="h-5 w-5" />,
  "Faith Formation": <Sparkles className="h-5 w-5" />,
  "Community Support": <Users className="h-5 w-5" />,
};

// Category colors mapping
const categoryColors: Record<string, string> = {
  "Personal Spiritual Guidance": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Prayer Requests": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Scripture Reflection": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  "Confession Preparation": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Faith Formation": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Community Support": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
};

export default function ReverendDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState({
    waiting: 0,
    active: 0,
    closed: 0,
    total: 0,
    todayNew: 0,
  });

  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      setIsLoading(true);
      try {
        const data = await getChatSessions();
        setSessions(data);

        // Calculate stats
        const waiting = data.filter((s: ChatSession) => s.status === 'waiting').length;
        const active = data.filter((s: ChatSession) => s.status === 'active').length;
        const closed = data.filter((s: ChatSession) => s.status === 'closed').length;
        const todayNew = data.filter(
          (s: ChatSession) => new Date(s.created_at).toDateString() === new Date().toDateString()
        ).length;

        setStats({
          waiting,
          active,
          closed,
          total: data.length,
          todayNew,
        });
      } catch (error) {
        console.error('Failed to load sessions:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading sessions',
          description: 'Please try again or contact support if the problem persists.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();

    // Set up real-time updates using Pusher
    Pusher.logToConsole = true;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user.${user?.id}`);
    channel.bind('session.updated', (data: { session: ChatSession }) => {
      setSessions((prev) => [data.session, ...prev]);
      // Update stats when new session arrives
      if (data.session.status === 'waiting') {
        setStats((prev) => ({
          ...prev,
          waiting: prev.waiting + 1,
          total: prev.total + 1,
          todayNew: prev.todayNew + 1,
        }));
      }
    });

    return () => {
      pusher.unsubscribe(`user.${user?.id}`);
    };
  }, [user, toast]);

  const handleAccept = async (sessionId: number) => {
    try {
      await acceptChatSession(sessionId);
      
      // Update local state
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, status: 'active' } : session
        )
      );

      setStats((prev) => ({
        ...prev,
        waiting: prev.waiting - 1,
        active: prev.active + 1,
      }));

      toast({
        title: 'Session Accepted',
        description: 'You have successfully accepted the chat session.',
      });

      router.push(`/reverend/chat/${sessionId}`);
    } catch (error) {
      console.error('Failed to accept session:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to accept session',
        description: 'Please try again or contact support if the problem persists.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5 mr-1" /> Waiting
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Active
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (categoryName: string) => {
    const colorClass = categoryColors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    const icon = categoryIcons[categoryName] || <MessageCircle className="h-4 w-4 mr-1" />;

    return (
      <Badge variant="outline" className={`${colorClass} flex items-center gap-1`}>
        {icon}
        {categoryName}
      </Badge>
    );
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.initial_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || session.category?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reverend Dashboard</h1>
          <p className="text-muted-foreground">
            Manage spiritual guidance sessions and connect with those seeking support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
          </Button>
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {stats.waiting > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {stats.waiting}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800 dark:text-blue-300">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">{stats.waiting}</div>
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-full">
                <Clock className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
              {stats.waiting > 0 ? `${stats.waiting} people waiting for guidance` : 'No one currently waiting'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800 dark:text-green-300">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-green-900 dark:text-green-200">{stats.active}</div>
              <div className="p-2 bg-green-200 dark:bg-green-800 rounded-full">
                <MessageCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400 mt-2">
              {stats.active > 0 ? `${stats.active} ongoing conversations` : 'No active conversations'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800 dark:text-purple-300">Today's New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-200">{stats.todayNew}</div>
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-full">
                <Calendar className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-2">
              {stats.todayNew > 0 ? `${stats.todayNew} new requests today` : 'No new requests today'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-800 dark:text-gray-300">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-200">{stats.total}</div>
              <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-400 mt-2">{stats.closed} sessions completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by message or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Personal Spiritual Guidance">Personal Spiritual Guidance</SelectItem>
              <SelectItem value="Prayer Requests">Prayer Requests</SelectItem>
              <SelectItem value="Scripture Reflection">Scripture Reflection</SelectItem>
              <SelectItem value="Confession Preparation">Confession Preparation</SelectItem>
              <SelectItem value="Faith Formation">Faith Formation</SelectItem>
              <SelectItem value="Community Support">Community Support</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs and Session Lists */}
      <Tabs defaultValue="waiting" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="waiting" className="relative">
            Waiting
            {stats.waiting > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.waiting}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-9 w-32" />
              </Card>
            ))}
          </div>
        ) : (
          ['waiting', 'active', 'closed'].map((status) => (
            <TabsContent key={status} value={status}>
              <ScrollArea className="h-[600px] pr-4">
                <AnimatePresence>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {filteredSessions.filter((session) => session.status === status).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted/30 p-4 rounded-full mb-4">
                          {status === 'waiting' ? (
                            <Clock className="h-8 w-8 text-muted-foreground" />
                          ) : status === 'active' ? (
                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium mb-1">No {status} sessions</h3>
                        <p className="text-muted-foreground max-w-sm">
                          {status === 'waiting'
                            ? 'There are currently no waiting sessions. Check back later or refresh the page.'
                            : status === 'active'
                            ? "You don't have any active sessions at the moment."
                            : 'No closed sessions to display.'}
                        </p>
                      </div>
                    ) : (
                      filteredSessions
                        .filter((session) => session.status === status)
                        .map((session) => (
                          <motion.div key={session.id} variants={itemVariants}>
                            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
                              <CardHeader className="pb-2 pt-4 px-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={`/placeholder.svg?text=${session.user?.first_name?.charAt(0)}`} />
                                      <AvatarFallback>{session.user?.first_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <CardTitle className="text-base">
                                        {session.user?.first_name || 'Anonymous User'}
                                      </CardTitle>
                                      <CardDescription>
                                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(session.status)}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {session.status === 'waiting' && (
                                          <DropdownMenuItem onClick={() => handleAccept(session.id)}>
                                            Accept Request
                                          </DropdownMenuItem>
                                        )}
                                        {session.status === 'active' && (
                                          <DropdownMenuItem onClick={() => router.push(`/reverend/chat/${session.id}`)}>
                                            Continue Chat
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        {session.status !== 'closed' && (
                                          <DropdownMenuItem className="text-destructive">
                                            Close Session
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="px-4 py-2">
                                <div className="mb-3">{getCategoryBadge(session.category?.name || '')}</div>
                                <p className="text-sm mb-2 line-clamp-3">{session.initial_message}</p>
                              </CardContent>
                              <CardFooter className="px-4 py-3 bg-muted/20 flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  {session.status === 'waiting'
                                    ? 'Waiting for acceptance'
                                    : session.status === 'active'
                                    ? `Active since ${formatDistanceToNow(
                                        new Date(session.accepted_at || session.created_at),
                                        { addSuffix: true }
                                      )}`
                                    : `Closed ${formatDistanceToNow(new Date(session.closed_at || ''), {
                                        addSuffix: true,
                                      })}`}
                                </div>
                                {session.status === 'waiting' && (
                                  <Button size="sm" onClick={() => handleAccept(session.id)}>
                                    Accept Request
                                  </Button>
                                )}
                                {session.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/reverend/chat/${session.id}`)}
                                    className="gap-1"
                                  >
                                    Continue Chat
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                )}
                                {session.status === 'closed' && (
                                  <Button size="sm" variant="outline">
                                    View Transcript
                                  </Button>
                                )}
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </TabsContent>
          ))
        )}
      </Tabs>
    </div>
  );
}