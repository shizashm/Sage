import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addWeeks, subWeeks, getHours } from 'date-fns';
import { schedulingApi, groupsApi } from '@/lib/api';

interface Session {
  id: string;
  groupName: string;
  date: Date;
  therapist: string;
  duration: number;
}

function getStatusLabel(date: Date): { label: string; className: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const tomorrow = addDays(today, 1);
  
  if (isSameDay(sessionDay, today)) {
    return { label: 'Today', className: 'bg-primary/20 text-primary' };
  }
  if (isSameDay(sessionDay, tomorrow)) {
    return { label: 'Tomorrow', className: 'bg-accent/50 text-accent-foreground' };
  }
  return { label: 'Upcoming', className: 'bg-secondary text-secondary-foreground' };
}

function NextSessionCard({ session }: { session: Session }) {
  const status = getStatusLabel(session.date);
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/10 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Session time confirmed
          </span>
        </div>
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">
              Next session
            </p>
            <p className="text-foreground font-medium text-lg">
              {session.groupName}
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-foreground/80">
            <Calendar className="w-4 h-4 text-primary/60" />
            <span>{format(session.date, 'EEEE, MMMM d')}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <Clock className="w-4 h-4 text-primary/60" />
            <span>{format(session.date, 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 text-primary/60" />
            <span>{session.therapist}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeekView({ 
  currentDate, 
  sessions, 
  onSessionClick 
}: { 
  currentDate: Date; 
  sessions: Session[]; 
  onSessionClick: (session: Session) => void;
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Time slots from 8 AM to 9 PM
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8);
  
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-border/30 rounded-t-lg overflow-hidden">
          <div className="bg-muted/30 p-2" /> {/* Empty corner */}
          {days.map((day) => (
            <div 
              key={day.toISOString()} 
              className={`bg-muted/30 p-3 text-center ${isToday(day) ? 'bg-primary/10' : ''}`}
            >
              <p className="text-xs text-muted-foreground font-medium">{format(day, 'EEE')}</p>
              <p className={`text-lg font-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px bg-border/20">
          {timeSlots.map((hour) => (
            <>
              {/* Time label */}
              <div 
                key={`time-${hour}`} 
                className="bg-background p-2 text-right pr-3 border-r border-border/30"
              >
                <span className="text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </span>
              </div>
              
              {/* Day cells for this hour */}
              {days.map((day) => {
                const hourSessions = sessions.filter(s => 
                  isSameDay(s.date, day) && getHours(s.date) === hour
                );
                
                return (
                  <div 
                    key={`${day.toISOString()}-${hour}`}
                    className={`bg-background min-h-[50px] p-1 border-b border-border/20 ${isToday(day) ? 'bg-primary/[0.02]' : ''}`}
                  >
                    {hourSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onSessionClick(session)}
                        className="w-full text-left p-2 rounded-md bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 hover:from-primary/30 hover:to-primary/20 transition-colors"
                      >
                        <p className="text-xs font-medium text-primary truncate">
                          {session.groupName}
                        </p>
                        <p className="text-[10px] text-primary/70">
                          {format(session.date, 'h:mm a')} · {session.duration}min
                        </p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({ 
  currentDate, 
  sessions, 
  onSessionClick 
}: { 
  currentDate: Date; 
  sessions: Session[]; 
  onSessionClick: (session: Session) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = addDays(startOfWeek(addDays(monthEnd, 6), { weekStartsOn: 0 }), 6);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div>
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-px bg-border/30 rounded-t-lg overflow-hidden">
        {weekDays.map((day) => (
          <div key={day} className="bg-muted/30 text-center py-3">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border/20">
        {days.map((day) => {
          const daySessions = sessions.filter(s => isSameDay(s.date, day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                min-h-[100px] p-2 bg-background transition-colors
                ${!isCurrentMonth ? 'bg-muted/10' : ''}
                ${isTodayDate ? 'bg-primary/[0.03]' : ''}
              `}
            >
              {/* Day number */}
              <div className="flex justify-end mb-1">
                <span 
                  className={`
                    text-sm w-7 h-7 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-primary text-primary-foreground font-medium' : ''}
                    ${!isCurrentMonth ? 'text-muted-foreground/40' : 'text-foreground/70'}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              {/* Session cards with details */}
              {daySessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSessionClick(session)}
                  className={`
                    w-full text-left p-2 rounded-md mb-1 transition-colors
                    bg-gradient-to-r from-primary/15 to-primary/10 
                    border border-primary/20 
                    hover:from-primary/25 hover:to-primary/15
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[11px] font-medium text-primary">
                      {format(session.date, 'h:mm a')}
                    </p>
                  </div>
                  <p className="text-xs text-foreground/80 truncate font-medium">
                    {session.groupName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {session.therapist}
                  </p>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UpcomingTab() {
  const [view, setView] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [slots, group] = await Promise.all([
          schedulingApi.slots(),
          groupsApi.my(),
        ]);
        if (cancelled) return;
        const groupName = group?.name ?? 'Group session';
        const mapped: Session[] = slots.map((s) => ({
          id: s.id,
          groupName,
          date: new Date(s.slot_at),
          therapist: '—',
          duration: 60,
        }));
        setSessions(mapped);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const upcomingSessions = sessions.filter((s) => s.date > new Date());
  const nextSession =
    upcomingSessions.length > 0
      ? upcomingSessions.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
      : null;

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };
  
  const getDateRangeLabel = () => {
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };
  
  // Loading or empty state
  if (loading) {
    return (
      <Card className="border-dashed border-border/50 bg-muted/20 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-20 px-6">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading upcoming sessions…</p>
        </CardContent>
      </Card>
    );
  }
  if (sessions.length === 0) {
    return (
      <Card className="border-dashed border-border/50 bg-gradient-to-br from-muted/20 to-background shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Calendar className="w-8 h-8 text-primary/50" />
          </div>
          <p className="text-foreground/70 font-medium mb-2">Nothing scheduled yet</p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Complete your intake and join a group, then choose a session time. Your sessions will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-5">
      {/* Next Session Card */}
      {nextSession && <NextSessionCard session={nextSession} />}
      
      {/* Calendar Card */}
      <Card className="border-border/40 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-4 py-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate('prev')}
                className="h-8 w-8 text-foreground/60 hover:text-foreground hover:bg-background/50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-base font-medium text-foreground min-w-[180px] text-center">
                {getDateRangeLabel()}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate('next')}
                className="h-8 w-8 text-foreground/60 hover:text-foreground hover:bg-background/50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* View toggle */}
            <div className="flex bg-muted/40 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('week')}
                className={`h-7 px-3 text-xs rounded-md transition-all ${
                  view === 'week' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('month')}
                className={`h-7 px-3 text-xs rounded-md transition-all ${
                  view === 'month' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
        
        {/* Calendar Content */}
        <CardContent className="p-0">
          {view === 'week' ? (
            <WeekView 
              currentDate={currentDate} 
              sessions={sessions} 
              onSessionClick={setSelectedSession}
            />
          ) : (
            <MonthView 
              currentDate={currentDate} 
              sessions={sessions} 
              onSessionClick={setSelectedSession}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-md border-border/40 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Session Details
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">Group</p>
                <p className="text-foreground font-medium">{selectedSession.groupName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">Date</p>
                  <p className="text-foreground/80">
                    {format(selectedSession.date, 'EEEE, MMM d, yyyy')}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">Time</p>
                  <p className="text-foreground/80">{format(selectedSession.date, 'h:mm a')}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">Therapist</p>
                <p className="text-foreground/80">{selectedSession.therapist}</p>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-primary/70 uppercase tracking-wide">Duration</p>
                <p className="text-foreground/80">{selectedSession.duration} minutes</p>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedSession(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
