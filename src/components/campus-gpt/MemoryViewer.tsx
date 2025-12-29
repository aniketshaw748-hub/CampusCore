import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Brain, Lightbulb, Target, BookOpen, Clock, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Memory {
  id: string;
  memory_type: 'preference' | 'weakness' | 'goal' | 'behavior' | 'context';
  content: string;
  created_at: string;
}

interface MemoryViewerProps {
  memories: Memory[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const memoryTypeConfig = {
  preference: {
    label: 'Learning Preference',
    icon: Lightbulb,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  weakness: {
    label: 'Area to Improve',
    icon: AlertCircle,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  goal: {
    label: 'Academic Goal',
    icon: Target,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  behavior: {
    label: 'Study Habit',
    icon: BookOpen,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  context: {
    label: 'Current Context',
    icon: Clock,
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
};

export function MemoryViewer({ memories, onDelete, isLoading }: MemoryViewerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const groupedMemories = memories.reduce((acc, memory) => {
    if (!acc[memory.memory_type]) {
      acc[memory.memory_type] = [];
    }
    acc[memory.memory_type].push(memory);
    return acc;
  }, {} as Record<string, Memory[]>);

  if (memories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5" />
            Memory
          </CardTitle>
          <CardDescription>
            CampusGPT learns about you through conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No memories yet</p>
            <p className="text-xs mt-1">
              Start chatting and CampusGPT will remember important things about your learning
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5" />
          Memory ({memories.length})
        </CardTitle>
        <CardDescription>
          Things CampusGPT remembers about you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {Object.entries(groupedMemories).map(([type, mems]) => {
              const config = memoryTypeConfig[type as keyof typeof memoryTypeConfig];
              const Icon = config?.icon || Brain;
              
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{config?.label || type}</span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {mems.map((memory) => (
                      <div
                        key={memory.id}
                        className="flex items-start justify-between gap-2 p-2 rounded-lg bg-secondary/50"
                      >
                        <p className="text-sm flex-1">{memory.content}</p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                              disabled={deletingId === memory.id}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete memory?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove this memory from CampusGPT. It won't be used in future conversations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(memory.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
