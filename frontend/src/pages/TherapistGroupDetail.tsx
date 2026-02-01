import { useParams, Link } from 'react-router-dom';
import { TherapistLayout } from '@/components/layouts/TherapistLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Brain,
  Target,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

// Mock group detail data
const mockGroupDetail = {
  id: 'grp_001',
  name: 'Workplace Wellness Warriors',
  focus_area: 'Work-Life Balance & Burnout Prevention',
  scheduled_time: '2026-02-03T18:00:00Z',
  participantCount: 6,
  
  // Briefing Pack content
  themeSummary: `This group shares a common thread of struggling with professional boundaries and the 
physical/emotional toll of chronic overwork. Members range from those in acute burnout to 
those in recovery, creating a valuable spectrum of perspectives.`,
  
  sharedGoals: [
    'Establish healthier work-life boundaries',
    'Develop sustainable stress management practices',
    'Build peer accountability for self-care',
    'Learn to recognize early warning signs of burnout',
  ],
  
  sharedChallenges: [
    'Difficulty saying "no" to additional responsibilities',
    'Guilt around taking time off or disconnecting',
    'Physical symptoms (sleep issues, headaches, fatigue)',
    'Imposter syndrome driving overwork',
  ],
  
  aiPatterns: [
    {
      pattern: 'High verbal engagement',
      insight: 'Group members consistently express themselves clearly and show strong introspection skills',
    },
    {
      pattern: 'Remote work clustering',
      insight: '4 of 6 participants specifically mention remote work challenges, suggesting this could be a unifying discussion topic',
    },
    {
      pattern: 'Recovery role model',
      insight: 'Morgan D. is further along in burnout recovery and could provide hope/mentorship to others',
    },
  ],
  
  riskFlags: [
    {
      level: 'moderate',
      participant: 'Alex M.',
      note: 'Elevated intensity with sleep disruption mentioned - monitor closely',
    },
    {
      level: 'low',
      participant: 'Riley P.',
      note: 'Job security anxiety may need individual follow-up if escalates',
    },
  ],
  
  participants: [
    {
      id: 'user_001',
      initials: 'AM',
      intensity: 'high',
      primaryConcern: 'Chronic overwork leading to burnout symptoms',
      goals: ['Learn to set boundaries', 'Improve sleep quality'],
    },
    {
      id: 'user_002',
      initials: 'JK',
      intensity: 'moderate',
      primaryConcern: 'Work-life balance after promotion',
      goals: ['Manage new responsibilities', 'Maintain relationships'],
    },
    {
      id: 'user_003',
      initials: 'ST',
      intensity: 'moderate',
      primaryConcern: 'Remote work isolation and overwork',
      goals: ['Create work-home boundaries', 'Build social connections'],
    },
    {
      id: 'user_004',
      initials: 'RP',
      intensity: 'high',
      primaryConcern: 'Anxiety about job security',
      goals: ['Manage work anxiety', 'Build resilience'],
    },
    {
      id: 'user_005',
      initials: 'CL',
      intensity: 'moderate',
      primaryConcern: 'Perfectionism and fear of failure',
      goals: ['Challenge perfectionist thoughts', 'Accept imperfection'],
    },
    {
      id: 'user_006',
      initials: 'MD',
      intensity: 'low',
      primaryConcern: 'Burnout recovery after leave',
      goals: ['Reintegrate gradually', 'Build sustainable habits'],
    },
  ],
  
  suggestedStructure: [
    { time: '0-10 min', activity: 'Check-in round - one word/phrase describing current state' },
    { time: '10-30 min', activity: 'Theme exploration - boundary-setting scenarios and role-play' },
    { time: '30-60 min', activity: 'Peer sharing - strategies that have worked, challenges faced' },
    { time: '60-80 min', activity: 'Action planning - one concrete step for the week ahead' },
    { time: '80-90 min', activity: 'Closing - gratitudes and commitments' },
  ],
};

const intensityColors = {
  low: 'bg-success/20 text-success',
  moderate: 'bg-warning/20 text-warning-foreground',
  high: 'bg-destructive/20 text-destructive',
};

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export default function TherapistGroupDetail() {
  const { groupId } = useParams();
  const group = mockGroupDetail;
  const { date, time } = formatDateTime(group.scheduled_time);

  return (
    <TherapistLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              to="/therapist"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-serif text-foreground">Briefing Pack</h1>
            </div>
            <h2 className="text-xl text-foreground">{group.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {time}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {group.participantCount} participants
              </span>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        <Separator />

        {/* Theme Summary */}
        <section>
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Group Theme Summary
          </h3>
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">{group.themeSummary}</p>
            </CardContent>
          </Card>
        </section>

        {/* Goals & Challenges */}
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-success" />
              Shared Goals
            </h3>
            <Card className="shadow-soft h-full">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {group.sharedGoals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{goal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Shared Challenges
            </h3>
            <Card className="shadow-soft h-full">
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {group.sharedChallenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                      <span className="text-foreground">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* AI Patterns */}
        <section className="mt-2">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-info" />
            AI-Detected Patterns
          </h3>
          <div className="grid gap-4">
            {group.aiPatterns.map((item, i) => (
              <Card key={i} className="shadow-soft border-info/20">
                <CardContent className="p-4 flex gap-4">
                  <TrendingUp className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">{item.pattern}</p>
                    <p className="text-sm text-muted-foreground">{item.insight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Risk Flags */}
        {group.riskFlags.length > 0 && (
          <section>
            <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive/70" />
              Gentle Attention Points
            </h3>
            <div className="space-y-3">
              {group.riskFlags.map((flag, i) => (
                <Card key={i} className="shadow-soft bg-muted/30">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Badge 
                      variant="outline" 
                      className={flag.level === 'moderate' ? 'bg-warning/20 text-warning-foreground border-warning/30' : 'bg-muted text-muted-foreground'}
                    >
                      {flag.level}
                    </Badge>
                    <div>
                      <span className="font-medium text-foreground">{flag.participant}: </span>
                      <span className="text-muted-foreground">{flag.note}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Participant Snapshots */}
        <section>
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Participant Snapshots
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.participants.map((participant) => (
              <Card key={participant.id} className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-primary">
                      {participant.initials}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={intensityColors[participant.intensity as keyof typeof intensityColors]}
                    >
                      {participant.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground mb-2">{participant.primaryConcern}</p>
                  <div className="flex flex-wrap gap-1">
                    {participant.goals.map((goal, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {goal}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Suggested Structure */}
        <section>
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Suggested Session Structure
          </h3>
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="space-y-4">
                {group.suggestedStructure.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-20 flex-shrink-0">
                      <span className="text-sm font-mono text-muted-foreground">{item.time}</span>
                    </div>
                    <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
                      <p className="text-foreground">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <Card className="shadow-soft bg-muted/30 border-border">
          <CardContent className="p-4 flex items-start gap-3">
            <Brain className="w-5 h-5 text-clinical-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">AI-Assisted Briefing</p>
              <p className="text-sm text-muted-foreground">
                This document was generated to support your preparation. All clinical decisions 
                remain with you. Participant names are anonymized to initials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TherapistLayout>
  );
}
