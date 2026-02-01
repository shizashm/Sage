import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEntry {
  id: string;
  date: string;
  sessionName: string;
  mood: 'happy' | 'neutral' | 'sad';
  moodScore: number; // 1-10
  summary: string;
  progressNotes: string;
}

interface ClientProgressTimelineProps {
  clientName: string;
  entries: TimelineEntry[];
}

const defaultEntries: TimelineEntry[] = [
  {
    id: '1',
    date: '2026-01-31',
    sessionName: 'Workplace Wellness Warriors',
    mood: 'happy',
    moodScore: 8,
    summary: 'Successfully set boundaries with manager about weekend emails. Feeling empowered.',
    progressNotes: 'Significant progress in assertiveness. Client is implementing strategies discussed.',
  },
  {
    id: '2',
    date: '2026-01-24',
    sessionName: 'Workplace Wellness Warriors',
    mood: 'neutral',
    moodScore: 6,
    summary: 'Discussed upcoming project deadline and coping strategies for stress.',
    progressNotes: 'Client is aware of triggers. Practicing breathing techniques before meetings.',
  },
  {
    id: '3',
    date: '2026-01-17',
    sessionName: 'Workplace Wellness Warriors',
    mood: 'sad',
    moodScore: 4,
    summary: 'Opened up about sleep issues and exhaustion from overwork.',
    progressNotes: 'First time discussing sleep. Provided sleep hygiene checklist to try.',
  },
  {
    id: '4',
    date: '2026-01-10',
    sessionName: 'Workplace Wellness Warriors',
    mood: 'sad',
    moodScore: 3,
    summary: 'Initial session. Expressed feeling overwhelmed and burnt out.',
    progressNotes: 'Intake complete. Primary concern is chronic overwork. Set initial goals.',
  },
  {
    id: '5',
    date: '2026-01-03',
    sessionName: 'Workplace Wellness Warriors',
    mood: 'neutral',
    moodScore: 5,
    summary: 'Introduction to group therapy format. Met other participants.',
    progressNotes: 'Client seemed hesitant initially but engaged well by end of session.',
  },
];

const moodIcons = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
};

const moodColors = {
  happy: 'text-success bg-success/10',
  neutral: 'text-warning bg-warning/10',
  sad: 'text-destructive bg-destructive/10',
};

export function ClientProgressTimeline({ 
  clientName = "Alex Morgan",
  entries = defaultEntries 
}: Partial<ClientProgressTimelineProps>) {
  // Calculate trend
  const recentScores = entries.slice(0, 3).map(e => e.moodScore);
  const olderScores = entries.slice(3).map(e => e.moodScore);
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.length > 0 
    ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length 
    : recentAvg;
  const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

  // Mood data for graph
  const moodData = [...entries].reverse().map(e => e.moodScore);

  return (
    <div className="space-y-6">
      {/* Mood Graph */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Mood Over Time</CardTitle>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1",
                trend === 'improving' && "text-success border-success/30",
                trend === 'declining' && "text-destructive border-destructive/30",
                trend === 'stable' && "text-muted-foreground"
              )}
            >
              {trend === 'improving' && <TrendingUp className="w-3 h-3" />}
              {trend === 'declining' && <TrendingDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple mood visualization */}
          <div className="h-24 flex items-end gap-1.5 px-2">
            {moodData.map((score, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    "w-full rounded-t-sm transition-all",
                    score >= 7 ? "bg-success" : score >= 5 ? "bg-warning" : "bg-destructive/70"
                  )}
                  style={{ height: `${score * 10}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(entries[entries.length - 1 - i]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Low</span>
            <span>Mood Score</span>
            <span>High</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Session Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <div className="relative px-6 py-4">
              {/* Timeline line */}
              <div className="absolute left-10 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {entries.map((entry, index) => {
                  const MoodIcon = moodIcons[entry.mood];
                  return (
                    <div key={entry.id} className="relative pl-10">
                      {/* Timeline node */}
                      <div className={cn(
                        "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2",
                        moodColors[entry.mood]
                      )}>
                        <MoodIcon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="bg-muted/30 rounded-lg p-4 ml-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.sessionName}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-foreground mb-2">
                          {entry.summary}
                        </p>
                        
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Progress Notes: </span>
                            {entry.progressNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
