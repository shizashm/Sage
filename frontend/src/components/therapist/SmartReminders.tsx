import { useState } from 'react';
import { Bell, X, Clock, MessageSquare, FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  type: 'session' | 'followup' | 'notes' | 'crisis';
  title: string;
  description: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel: string;
}

const mockReminders: Reminder[] = [
  {
    id: '1',
    type: 'crisis',
    title: 'Crisis language detected',
    description: 'Review chat with Jordan Kim - flagged keywords detected',
    priority: 'high',
    actionLabel: 'Review Now',
  },
  {
    id: '2',
    type: 'session',
    title: 'Session starting in 1 hour',
    description: 'Anxiety Support Circle - 6 participants',
    time: '2:00 PM',
    priority: 'medium',
    actionLabel: 'Prepare',
  },
  {
    id: '3',
    type: 'followup',
    title: 'Follow up with Sarah',
    description: 'You noted this 3 days ago - check on sleep progress',
    priority: 'medium',
    actionLabel: 'View Notes',
  },
  {
    id: '4',
    type: 'notes',
    title: 'Complete session notes',
    description: 'Grief Support session from yesterday',
    priority: 'low',
    actionLabel: 'Add Notes',
  },
  {
    id: '5',
    type: 'session',
    title: 'Session in 3 hours',
    description: 'Workplace Wellness Warriors - 8 participants',
    time: '5:00 PM',
    priority: 'low',
    actionLabel: 'View Brief',
  },
];

const typeIcons = {
  session: Clock,
  followup: MessageSquare,
  notes: FileText,
  crisis: AlertTriangle,
};

const priorityStyles = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
  low: 'border-l-muted-foreground/30',
};

export function SmartReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [open, setOpen] = useState(false);

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const unreadCount = reminders.length;
  const hasHighPriority = reminders.some(r => r.priority === 'high');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center text-primary-foreground",
              hasHighPriority ? "bg-destructive animate-pulse" : "bg-primary"
            )}>
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-0 bg-popover border shadow-lg" 
        align="end" 
        sideOffset={8}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Reminders</h3>
            <Badge variant="secondary" className="text-xs">
              {unreadCount} pending
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {reminders.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reminders.map((reminder) => {
                const Icon = typeIcons[reminder.type];
                return (
                  <div
                    key={reminder.id}
                    className={cn(
                      "p-4 border-l-4 transition-colors hover:bg-muted/50",
                      priorityStyles[reminder.priority]
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        reminder.type === 'crisis' 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              reminder.type === 'crisis' ? "text-destructive" : "text-foreground"
                            )}>
                              {reminder.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {reminder.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 -mt-1 -mr-1 text-muted-foreground hover:text-foreground"
                            onClick={() => dismissReminder(reminder.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {reminder.time && (
                            <span className="text-xs text-muted-foreground">
                              {reminder.time}
                            </span>
                          )}
                          <Button
                            variant={reminder.type === 'crisis' ? 'destructive' : 'outline'}
                            size="sm"
                            className="h-7 text-xs ml-auto gap-1"
                          >
                            {reminder.actionLabel}
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {reminders.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground"
              onClick={() => setReminders([])}
            >
              Dismiss all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
