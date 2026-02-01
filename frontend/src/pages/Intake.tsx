import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Target, Briefcase, Users, Shield } from 'lucide-react';

// Mock intake data
const mockIntake = {
  primary_concern: 'Work-related stress and burnout',
  emotional_intensity: 'moderate' as const,
  impact_areas: ['Work performance', 'Sleep quality', 'Relationships', 'Physical health'],
  support_goals: [
    'Learn stress management techniques',
    'Connect with others facing similar challenges',
    'Develop better work-life boundaries',
    'Build resilience for future challenges',
  ],
  summary:
    'You are experiencing moderate work-related stress that is affecting multiple areas of your life. You are looking for peer support and practical coping strategies to manage burnout and establish healthier boundaries.',
};

const intensityColors = {
  low: 'bg-success/20 text-success border-success/30',
  moderate: 'bg-warning/20 text-warning-foreground border-warning/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

const intensityProgress = {
  low: 33,
  moderate: 66,
  high: 100,
};

export default function Intake() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Your Intake Summary</h1>
            <p className="text-muted-foreground mt-1">
              A transparent view of what you shared
            </p>
          </div>
          <Shield className="w-8 h-8 text-primary opacity-50" />
        </div>

        {/* Summary Card */}
        <Card className="shadow-soft-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Summary</h2>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {mockIntake.summary}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Primary Concern & Intensity */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-destructive" />
                Primary Concern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-foreground">
                {mockIntake.primary_concern}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-warning" />
                Emotional Intensity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={intensityColors[mockIntake.emotional_intensity]}
                >
                  {mockIntake.emotional_intensity.charAt(0).toUpperCase() +
                    mockIntake.emotional_intensity.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {intensityProgress[mockIntake.emotional_intensity]}%
                </span>
              </div>
              <Progress
                value={intensityProgress[mockIntake.emotional_intensity]}
                className="h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Impact Areas */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-info" />
              Areas of Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockIntake.impact_areas.map((area) => (
                <Badge key={area} variant="secondary" className="px-3 py-1">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Goals */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-success" />
              Support Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockIntake.support_goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Trust Note */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p>
            This summary is generated from your intake conversation. It helps us match you with the right support group but is never shared publicly.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
