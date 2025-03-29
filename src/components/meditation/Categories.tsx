'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Cross, Heart, HelpingHand as PrayingHands, HelpCircle, BookOpen } from 'lucide-react';
import { createChatSession } from '@/lib/api';
import { useRouter } from 'next/navigation';

const categories = [
  {
    id: 1,
    name: 'Spiritual Advice',
    description: 'Seek guidance on your spiritual journey',
    icon: <Cross className="h-8 w-8" />,
  },
  {
    id: 2,
    name: 'Prayer Requests',
    description: 'Request prayers for your intentions',
    icon: <PrayingHands className="h-8 w-8" />,
  },
  {
    id: 3,
    name: 'Personal Problems',
    description: 'Discuss personal challenges in a faith context',
    icon: <Heart className="h-8 w-8" />,
  },
  {
    id: 4,
    name: 'Faith Questions',
    description: 'Get answers about Catholic teachings',
    icon: <BookOpen className="h-8 w-8" />,
  },
];

export function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedCategory || !message.trim()) return;

    try {
      const session = await createChatSession(selectedCategory, message);
      router.push(`/meditation/chat/${session.id}`);
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {category.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

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
            />
            <Button onClick={handleSubmit} className="w-full">
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}