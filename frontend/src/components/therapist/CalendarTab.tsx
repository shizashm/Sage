import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Clock, 
  Play, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionWorkspace } from './SessionWorkspace';
import { TherapistGreeting } from './TherapistGreeting';
import { TherapistChecklist } from './TherapistChecklist';

// Mock data
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const mockWeekSessions = [
  { id: 's1', day: 0, hour: 10, duration: 1.5, name: 'Workplace Wellness', participants: 6, focus: 'Burnout', tags: ['Stress', 'Balance'], status: 'completed' },
  { id: 's2', day: 0, hour: 14, duration: 1.5, name: 'Anxiety Support Circle', participants: 5, focus: 'Anxiety', tags: ['Social Anxiety', 'Mindfulness'], status: 'upcoming' },
  { id: 's3', day: 0, hour: 17, duration: 1.5, name: 'New Parents Network', participants: 4, focus: 'Postpartum', tags: ['Sleep', 'Identity'], status: 'upcoming' },
  { id: 's4', day: 2, hour: 11, duration: 1.5, name: 'Grief Support', participants: 6, focus: 'Loss', tags: ['Healing', 'Community'], status: 'upcoming' },
  { id: 's5', day: 4, hour: 14, duration: 1.5, name: 'Teen Support Group', participants: 5, focus: 'Youth', tags: ['School', 'Identity'], status: 'upcoming' },
];

interface SessionData {
  id: string;
  groupId: string;
  groupName: string;
  focusArea: string;
  time: string;
  endTime: string;
  participantCount: number;
  status: string;
  tags: string[];
}

function formatHour(hour: number, duration: number) {
  const startStr = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
  const endHour = hour + duration;
  const endStr = endHour > 12 ? `${Math.floor(endHour) - 12}:${(endHour % 1) * 60 || '00'} PM` : `${Math.floor(endHour)}:${(endHour % 1) * 60 || '00'} AM`;
  return { startStr, endStr };
}

export function CalendarTab() {
  const [view, setView] = useState<'day' | 'week'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const todayIndex = weekDates.findIndex(d => d.toDateString() === new Date().toDateString());
  
  // Today's sessions
  const todaySessions = mockWeekSessions.filter(s => s.day === (todayIndex >= 0 ? todayIndex : 0));
  const completedCount = todaySessions.filter(s => s.status === 'completed').length;
  const upcomingCount = todaySessions.filter(s => s.status === 'upcoming').length;
  const nextSession = todaySessions.find(s => s.status === 'upcoming');

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleSessionClick = (session: typeof mockWeekSessions[0], dayIndex: number) => {
    const { startStr, endStr } = formatHour(session.hour, session.duration);
    setSelectedSession({
      id: session.id,
      groupId: session.id,
      groupName: session.name,
      focusArea: session.focus,
      time: startStr,
      endTime: endStr,
      participantCount: session.participants,
      status: session.status,
      tags: session.tags,
    });
  };

  const handleStartSession = (session: SessionData) => {
    setActiveSession(session);
    setSelectedSession(null);
  };

  // Show session workspace if active
  if (activeSession) {
    return (
      <SessionWorkspace 
        session={activeSession}
        onClose={() => setActiveSession(null)} 
      />
    );
  }

  const timeSlots = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];
  const getHourFromSlot = (slotIndex: number) => slotIndex + 9;

  return (
    <div className="space-y-6">
      {/* ========== PERSONALIZED GREETING ========== */}
      <TherapistGreeting />

      {/* ========== TODAY'S AGENDA + CHECKLIST SIDE BY SIDE ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Today's Sessions */}
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Today's Sessions</h3>
                <span className="text-xs font-normal text-muted-foreground/60">
                  ({upcomingCount} upcoming)
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  {completedCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {upcomingCount}
                </span>
              </div>
            </div>

            {/* Session Cards */}
            {todaySessions.length > 0 ? (
              <div className="space-y-2">
                {todaySessions.map((session) => {
                  const { startStr, endStr } = formatHour(session.hour, session.duration);
                  const sessionData: SessionData = {
                    id: session.id,
                    groupId: session.id,
                    groupName: session.name,
                    focusArea: session.focus,
                    time: startStr,
                    endTime: endStr,
                    participantCount: session.participants,
                    status: session.status,
                    tags: session.tags,
                  };

                  return (
                    <div 
                      key={session.id} 
                      className={cn(
                        "group flex items-center gap-3 p-3 rounded-lg border-l-3 transition-all",
                        session.status === 'completed' 
                          ? 'border-l-muted-foreground/30 bg-muted/20' 
                          : 'border-l-primary bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      {/* Time */}
                      <div className="w-14 flex-shrink-0 text-center">
                        <p className={cn(
                          "text-xs font-semibold",
                          session.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'
                        )}>{startStr}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">
                          {session.duration * 60}min
                        </p>
                      </div>

                      <div className="w-px h-8 bg-border/50" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            session.status === 'completed' ? 'text-muted-foreground' : 'text-foreground/90'
                          )}>{session.name}</h4>
                          {session.status === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal">
                            {session.focus}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" />
                            {session.participants}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {session.status === 'upcoming' && (
                          <Button 
                            size="sm" 
                            className="h-7 text-xs gap-1 px-2.5"
                            onClick={() => handleStartSession(sessionData)}
                          >
                            <Play className="w-3 h-3" />
                            Start
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No sessions scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Therapist Checklist */}
        <TherapistChecklist />
      </div>

      <Separator className="my-6" />

      {/* ========== CALENDAR ========== */}
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <button 
              onClick={goToToday}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2"
            >
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-2 text-xs h-7" onClick={goToToday}>
              Today
            </Button>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="day" className="text-xs px-3 h-6">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-6">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Calendar Grid */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Day Headers */}
            <div className={cn(
              "grid bg-muted/30",
              view === 'week' ? 'grid-cols-[48px_repeat(7,1fr)]' : 'grid-cols-[48px_1fr]'
            )}>
              <div className="p-2" />
              {view === 'week' ? (
                weekDays.map((day, i) => {
                  const date = weekDates[i];
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={day} 
                      className={cn(
                        'py-2 px-1 text-center border-l border-border/50',
                        isToday && 'bg-primary/5'
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{day}</p>
                      <div className={cn(
                        'w-7 h-7 mx-auto rounded-full flex items-center justify-center text-sm font-medium mt-0.5',
                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                      )}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-2 px-3 text-center border-l border-border/50 bg-primary/5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {weekDates[todayIndex >= 0 ? todayIndex : 0].toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-sm font-medium text-primary mt-0.5">
                    {weekDates[todayIndex >= 0 ? todayIndex : 0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* Time Grid */}
            <div className={cn(
              "grid max-h-[360px] overflow-y-auto",
              view === 'week' ? 'grid-cols-[48px_repeat(7,1fr)]' : 'grid-cols-[48px_1fr]'
            )}>
              {timeSlots.map((time, slotIndex) => (
                <div key={time} className="contents">
                  <div className="py-0.5 px-1 text-[10px] text-muted-foreground text-right border-b border-border/30 h-10 flex items-start justify-end pt-0.5">
                    {time}
                  </div>
                  {view === 'week' ? (
                    weekDays.map((_, dayIndex) => {
                      const session = mockWeekSessions.find(
                        s => s.day === dayIndex && s.hour === getHourFromSlot(slotIndex)
                      );
                      const isToday = weekDates[dayIndex].toDateString() === new Date().toDateString();
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={cn(
                            'border-l border-b border-border/30 h-10 relative',
                            isToday && 'bg-primary/[0.02]'
                          )}
                        >
                          {session && (
                            <button
                              onClick={() => handleSessionClick(session, dayIndex)}
                              className={cn(
                                "absolute inset-x-0.5 top-0.5 p-1 rounded text-left transition-all",
                                "hover:ring-2 hover:ring-primary/40 hover:z-10",
                                session.status === 'completed' 
                                  ? 'bg-muted/80' 
                                  : 'bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/20'
                              )}
                              style={{ height: `${session.duration * 40 - 4}px` }}
                            >
                              <p className={cn(
                                "text-[10px] font-medium truncate leading-tight",
                                session.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'
                              )}>{session.name}</p>
                              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Users className="w-2 h-2" />
                                {session.participants}
                              </p>
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="border-l border-b border-border/30 h-10 relative bg-primary/[0.02]">
                      {mockWeekSessions.filter(s => s.day === todayIndex && s.hour === getHourFromSlot(slotIndex)).map(session => (
                        <button
                          key={session.id}
                          onClick={() => handleSessionClick(session, todayIndex)}
                          className={cn(
                            "absolute inset-x-1 top-0.5 p-2 rounded text-left transition-all",
                            "hover:ring-2 hover:ring-primary/40",
                            session.status === 'completed' 
                              ? 'bg-muted/80' 
                              : 'bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/20'
                          )}
                          style={{ height: `${session.duration * 40 - 4}px` }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{session.name}</p>
                            <Badge variant="secondary" className="text-[10px] h-5">{session.focus}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" />
                            {session.participants} participants
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Side Panel */}
      <Sheet open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <SheetContent className="w-[360px] sm:w-[400px]">
          {selectedSession && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-lg">{selectedSession.groupName}</SheetTitle>
                    <Badge variant="secondary" className="mt-2">{selectedSession.focusArea}</Badge>
                  </div>
                  {selectedSession.status === 'completed' && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Completed
                    </Badge>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Time</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedSession.time}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Participants</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedSession.participantCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedSession.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  {selectedSession.status !== 'completed' && (
                    <Button className="gap-2" onClick={() => handleStartSession(selectedSession)}>
                      <Play className="w-4 h-4" />
                      Start Session
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Briefing
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
