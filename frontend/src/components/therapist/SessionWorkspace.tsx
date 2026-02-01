import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Save, 
  CheckCircle2,
  User,
  Brain,
  History,
  Target,
  MessageSquare,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
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

interface SessionWorkspaceProps {
  session: Session;
  onClose: () => void;
}

// Mock participants
const mockParticipants = [
  { id: 'user_001', name: 'Alex M.', intensity: 'high', concern: 'Chronic overwork' },
  { id: 'user_002', name: 'Jordan K.', intensity: 'moderate', concern: 'Work-life balance' },
  { id: 'user_003', name: 'Sam T.', intensity: 'moderate', concern: 'Remote isolation' },
  { id: 'user_004', name: 'Riley P.', intensity: 'high', concern: 'Job anxiety' },
  { id: 'user_005', name: 'Casey L.', intensity: 'moderate', concern: 'Perfectionism' },
  { id: 'user_006', name: 'Morgan D.', intensity: 'low', concern: 'Burnout recovery' },
];

// Mock past notes
const mockPastNotes = [
  {
    id: 'note_1',
    date: '2026-01-24',
    groupName: 'Workplace Wellness Warriors',
    mood: 'Engaged',
    keyPoints: 'Discussed boundary-setting strategies',
    followUp: 'Practice saying no to one request this week',
  },
  {
    id: 'note_2',
    date: '2026-01-17',
    groupName: 'Workplace Wellness Warriors',
    mood: 'Anxious',
    keyPoints: 'Shared about upcoming project deadline stress',
    followUp: 'Identify one stress relief technique',
  },
];

const intensityColors = {
  low: 'bg-success/20 text-success',
  moderate: 'bg-warning/20 text-warning-foreground',
  high: 'bg-destructive/20 text-destructive',
};

export function SessionWorkspace({ session, onClose }: SessionWorkspaceProps) {
  const [selectedParticipant, setSelectedParticipant] = useState(mockParticipants[0]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [notesTab, setNotesTab] = useState('session');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Notes state
  const [notes, setNotes] = useState({
    mood: '',
    keyPoints: '',
    followUp: '',
    privateNotes: '',
  });

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-save simulation
  useEffect(() => {
    const hasContent = Object.values(notes).some(v => v.trim());
    if (!hasContent) return;

    const timeout = setTimeout(() => {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [notes]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] -mx-4 lg:-mx-8">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-medium text-foreground">{session.groupName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary">{session.focusArea}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {session.participantCount} participants
                </span>
              </div>
            </div>
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-mono text-lg font-medium text-foreground">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <Button 
              variant={isRunning ? 'outline' : 'default'}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="destructive" onClick={onClose}>
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid lg:grid-cols-[300px_1fr_400px] h-[calc(100vh-280px)]">
        {/* Left: Session Details */}
        <div className="border-r border-border bg-muted/20 p-4 overflow-auto">
          <div className="space-y-6">
            {/* Quick Overview */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Session Overview</h3>
              <Card className="shadow-soft">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm font-medium">{session.time} - {session.endTime}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <span className="text-sm font-medium">{session.participantCount}</span>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Topics</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Insights
              </h3>
              <Card className="shadow-soft border-primary/20">
                <CardContent className="p-4 text-sm space-y-3">
                  <p className="text-muted-foreground">
                    Group shows high engagement around boundary-setting topics. Consider exploring practical scenarios.
                  </p>
                  <div className="flex items-start gap-2 p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-warning-foreground">
                      Alex M. and Riley P. have elevated intensity - check in early.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Center: Participants */}
        <div className="border-r border-border p-4 overflow-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Participants</h3>
          <div className="grid gap-3">
            {mockParticipants.map((participant) => (
              <Card 
                key={participant.id}
                className={cn(
                  'shadow-soft cursor-pointer transition-all',
                  selectedParticipant.id === participant.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-soft-lg'
                )}
                onClick={() => setSelectedParticipant(participant)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{participant.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', intensityColors[participant.intensity as keyof typeof intensityColors])}
                        >
                          {participant.intensity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{participant.concern}</p>
                    </div>
                    {selectedParticipant.id === participant.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Notes Panel */}
        <div className="bg-card p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">{selectedParticipant.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isSaving && (
                <>
                  <Save className="w-3 h-3 animate-pulse" />
                  <span>Saving...</span>
                </>
              )}
              {!isSaving && lastSaved && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-success" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>

          <Tabs value={notesTab} onValueChange={setNotesTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="session" className="flex-1 gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Session Notes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 gap-1.5">
                <History className="w-3.5 h-3.5" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="session" className="mt-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  Mood / Observations
                </label>
                <Textarea 
                  placeholder="How are they presenting today?"
                  value={notes.mood}
                  onChange={(e) => setNotes(n => ({ ...n, mood: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Key Points
                </label>
                <Textarea 
                  placeholder="Important topics or breakthroughs"
                  value={notes.keyPoints}
                  onChange={(e) => setNotes(n => ({ ...n, keyPoints: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  Follow-ups
                </label>
                <Textarea 
                  placeholder="Action items or things to revisit"
                  value={notes.followUp}
                  onChange={(e) => setNotes(n => ({ ...n, followUp: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded">Private</span>
                  Therapist Notes
                </label>
                <Textarea 
                  placeholder="Private observations (not shared)"
                  value={notes.privateNotes}
                  onChange={(e) => setNotes(n => ({ ...n, privateNotes: e.target.value }))}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {mockPastNotes.map((note) => (
                    <Card key={note.id} className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-foreground">{note.date}</span>
                          <Badge variant="outline" className="text-xs">{note.groupName}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Mood: </span>
                            <span className="text-foreground">{note.mood}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Key Points: </span>
                            <span className="text-foreground">{note.keyPoints}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Follow-up: </span>
                            <span className="text-foreground">{note.followUp}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
