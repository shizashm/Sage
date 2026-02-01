import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthGarden } from '@/components/growth/GrowthGarden';
import { UpcomingTab } from '@/components/upcoming/UpcomingTab';
import { intakeApi, schedulingApi, type IntakeResponse, type SlotResponse } from '@/lib/api';
import { groupsApi, type GroupResponse } from '@/lib/api';
import { format } from 'date-fns';
import { MentraBackground } from '@/components/backgrounds/MentraBackground';
import {
  MessageCircle,
  FileText,
  Users,
  Leaf,
  Calendar,
  Heart,
  Target,
  Sparkles,
  Lock,
  DoorOpen,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const STRESS_BALANCE_GROUP_NAME = 'Stress & Balance Support Circle';
const STRESS_BALANCE_DESCRIPTION =
  'A supportive space for people navigating work stress, burnout, and the challenge of finding balance. This group focuses on practical strategies and shared experiences.';
const STRESS_BALANCE_MEMBERS = { filled: 4, total: 6, initials: ['AM', 'JK', 'SR', 'TP'] as const };
const STRESS_BALANCE_WHY_RECOMMENDED =
  'Based on what you shared about feeling overwhelmed at work and wanting to build healthier boundaries, this group aligns closely with your needs. The members are working through similar challenges, and the focus on practical coping strategies matches your goals.';
const STRESS_BALANCE_ALIGNMENT = [
  'Similar primary concerns around work stress',
  'Shared goals of building boundaries',
  'Matching emotional intensity level',
] as const;

const SAMPLE_AI_SUMMARY =
  "From our conversation, it's clear you've been carrying a lot lately — especially around work and the pressure to always be \"on.\" You mentioned feeling stretched thin, struggling to switch off at the end of the day, and noticing how that stress has started to affect your sleep and energy levels. It takes courage to acknowledge when things feel heavy, and reaching out is an important first step.";
const SAMPLE_PRIMARY_CONCERN = 'Work-related stress and burnout';
const SAMPLE_EMOTIONAL_INTENSITY = { level: 'Moderate' as const, percent: 55 };
const SAMPLE_AREAS_OF_IMPACT = [
  'Work performance',
  'Sleep quality',
  'Energy levels',
  'Personal relationships',
  'Physical health',
] as const;
const SAMPLE_SUPPORT_GOALS = [
  'Learn stress management techniques',
  'Connect with others facing similar challenges',
  'Build healthier boundaries between work and personal life',
  'Develop a sustainable self-care routine',
] as const;

function mapEmotionalIntensity(value: number | null): { level: string; value: number } {
  if (value == null) return { level: '—', value: 0 };
  if (value <= 33) return { level: 'Low', value: 25 };
  if (value <= 66) return { level: 'Moderate', value: 50 };
  return { level: 'High', value: 75 };
}

function parseSupportGoals(s: string | null): string[] {
  if (!s?.trim()) return [];
  return s.split(/[,;]|\n/).map((g) => g.trim()).filter(Boolean);
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showChatInstructions, setShowChatInstructions] = useState(false);
  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [hasSlots, setHasSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [intakeSettled, groupSettled, slotsSettled] = await Promise.allSettled([
        intakeApi.get(),
        groupsApi.my(),
        schedulingApi.slots(),
      ]);
      if (cancelled) return;
      setIntake(intakeSettled.status === 'fulfilled' ? intakeSettled.value : null);
      setGroup(groupSettled.status === 'fulfilled' ? groupSettled.value ?? null : null);
      const slotsList = slotsSettled.status === 'fulfilled' ? slotsSettled.value : [];
      setSlots(Array.isArray(slotsList) ? slotsList : []);
      setHasSlots(Array.isArray(slotsList) && slotsList.length > 0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const hasIntake =
    intake &&
    (intake.primary_concern ||
      intake.contextual_background ||
      (intake.life_impact_areas && intake.life_impact_areas.length > 0) ||
      intake.support_goals);
  const statusCopy =
    hasIntake && !group
      ? 'Matching in progress'
      : group && !hasSlots
        ? 'Group almost ready — choose a session time'
        : group && hasSlots
          ? 'Session time confirmed'
          : null;
  const emotionalDisplay = mapEmotionalIntensity(intake?.emotional_intensity ?? null);
  const impactAreas = intake?.life_impact_areas ?? [];
  const supportGoalsList = parseSupportGoals(intake?.support_goals ?? null);

  const handleBeginChat = () => {
    setShowChatInstructions(false);
    navigate('/chat');
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
        <MentraBackground variant="mid" className="z-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
          <Card className="border-border/60 bg-card/50 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-medium text-primary tracking-wide mb-1">
                {getFormattedDate()}
              </p>
              <h1 className="text-2xl font-serif text-foreground">
                {getTimeGreeting()}, <span className="text-primary">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Here&apos;s your space today</p>
              {statusCopy && (
                <span className="inline-block mt-3 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {statusCopy}
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium text-foreground">Ready to talk?</h2>
                  <p className="text-sm text-muted-foreground">Start a new conversation or continue where you left off.</p>
                </div>
                <Button 
                  onClick={() => setShowChatInstructions(true)} 
                  size="lg"
                  className="shrink-0 gap-2 bg-primary hover:bg-primary/90"
                >
                  <MessageCircle className="w-4 h-4" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showChatInstructions} onOpenChange={setShowChatInstructions}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 overflow-hidden">
              <ScrollArea className="max-h-[85vh]">
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-serif text-foreground">Hi {firstName}</h2>
                  </div>
                  <Card className="p-4 shadow-soft border-border/50 bg-card/80">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-foreground font-medium text-sm">Everything you share is private</p>
                      </div>
                      <div className="h-px bg-border/50" />
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-foreground font-medium text-sm">A real therapist is involved</p>
                      </div>
                      <div className="h-px bg-border/50" />
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-foreground font-medium text-sm">There's no rush, go at your own pace</p>
                      </div>
                      <div className="h-px bg-border/50" />
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <DoorOpen className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-foreground font-medium text-sm">You can leave anytime, no pressure</p>
                      </div>
                    </div>
                  </Card>
                  <div className="space-y-4 pt-2">
                    <p className="text-center text-muted-foreground text-sm leading-relaxed">
                      There are no right or wrong answers here.<br />
                      Share only what feels comfortable — <span className="text-foreground font-normal">you're always in control</span>.
                    </p>
                    <Button onClick={handleBeginChat} size="lg" className="w-full h-12 text-base font-medium shadow-soft">
                      I'm ready, let's begin
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowChatInstructions(false)}
                      className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                      I'm not ready yet
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-auto p-1">
              <TabsTrigger value="summary" className="flex flex-col gap-1 py-3 text-xs">
                <FileText className="w-4 h-4" />
                <span>My Summary</span>
              </TabsTrigger>
              <TabsTrigger value="group" className="flex flex-col gap-1 py-3 text-xs">
                <Users className="w-4 h-4" />
                <span>My Group</span>
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex flex-col gap-1 py-3 text-xs">
                <Leaf className="w-4 h-4" />
                <span>Growth</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex flex-col gap-1 py-3 text-xs">
                <Calendar className="w-4 h-4" />
                <span>Upcoming</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              <TabsContent value="summary" className="mt-0 space-y-6">
                {loading ? (
                  <Card className="border-dashed border-border/60 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading your summary…</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="border-border/60 bg-card/50 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-foreground">AI Summary</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {(intake?.contextual_background?.trim()?.length ?? 0) > 60
                            ? intake.contextual_background
                            : SAMPLE_AI_SUMMARY}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-border/60 bg-card/50 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-foreground">Primary Concern</h3>
                          </div>
                          <p className="text-foreground font-medium">
                            {intake?.primary_concern?.trim()
                              ? intake.primary_concern
                              : SAMPLE_PRIMARY_CONCERN}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-border/60 bg-card/50 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-foreground">Emotional Intensity</h3>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-foreground">
                              {intake?.emotional_intensity != null && intake.emotional_intensity >= 0
                                ? emotionalDisplay.level
                                : SAMPLE_EMOTIONAL_INTENSITY.level}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {intake?.emotional_intensity != null && intake.emotional_intensity >= 0
                                ? `${emotionalDisplay.value}%`
                                : `${SAMPLE_EMOTIONAL_INTENSITY.percent}%`}
                            </span>
                          </div>
                          <Progress
                            value={
                              intake?.emotional_intensity != null && intake.emotional_intensity >= 0
                                ? emotionalDisplay.value
                                : SAMPLE_EMOTIONAL_INTENSITY.percent
                            }
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-border/60 bg-card/50 shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="font-medium text-foreground mb-4">Areas of Impact</h3>
                        <div className="flex flex-wrap gap-2">
                          {(impactAreas.length > 0 ? impactAreas : [...SAMPLE_AREAS_OF_IMPACT]).map((area) => (
                            <Badge
                              key={area}
                              variant="outline"
                              className="font-normal bg-muted/50 border-border/60"
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/50 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-primary" />
                          <h3 className="font-medium text-foreground">Support Goals</h3>
                        </div>
                        <ul className="space-y-3">
                          {(supportGoalsList.length >= 3 ? supportGoalsList : [...SAMPLE_SUPPORT_GOALS]).map((goal, i) => (
                            <li key={goal} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium">
                                {i + 1}
                              </span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="group" className="mt-0 space-y-6">
                {loading ? (
                  <Card className="border-dashed border-border/60 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading your group…</p>
                    </CardContent>
                  </Card>
                ) : !group ? (
                  <EmptyState
                    icon={<Users className="w-12 h-12" />}
                    message="Complete your intake to get matched with a support group. Start a chat to share what's on your mind, then we'll recommend a group that fits."
                  />
                ) : (
                  <div className="space-y-6">
                    <Card className="border-border/60 bg-card/50 shadow-sm">
                      <CardContent className="p-6 space-y-5">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {group.name === STRESS_BALANCE_GROUP_NAME
                              ? STRESS_BALANCE_DESCRIPTION
                              : group.focus}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-full bg-primary text-primary-foreground">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">SC</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">Dr. Sarah Chen</p>
                            <p className="text-sm text-muted-foreground">Licensed Clinical Psychologist</p>
                          </div>
                        </div>

                        {group.name === STRESS_BALANCE_GROUP_NAME && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Current Members</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {STRESS_BALANCE_MEMBERS.initials.map((initials) => (
                                <Avatar key={initials} className="h-9 w-9 rounded-full border-2 border-background bg-primary/20 text-primary">
                                  <AvatarFallback className="text-xs font-medium bg-transparent">{initials}</AvatarFallback>
                                </Avatar>
                              ))}
                              {Array.from({ length: STRESS_BALANCE_MEMBERS.total - STRESS_BALANCE_MEMBERS.filled }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30" />
                              ))}
                              <span className="text-sm text-muted-foreground ml-1">
                                {STRESS_BALANCE_MEMBERS.filled} of {STRESS_BALANCE_MEMBERS.total} spots filled
                              </span>
                            </div>
                          </div>
                        )}

                        {slots.length > 0 && (() => {
                          const upcoming = slots
                            .map((s) => ({ ...s, at: new Date(s.slot_at) }))
                            .filter((s) => s.at > new Date())
                            .sort((a, b) => a.at.getTime() - b.at.getTime());
                          const next = upcoming[0];
                          if (!next) return null;
                          return (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 text-primary/70" />
                              <span>
                                Next session: {format(next.at, 'EEEE, MMMM d')} at {format(next.at, 'h:mm a')}
                              </span>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-card/50 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              Why this group was recommended
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                              {group.name === STRESS_BALANCE_GROUP_NAME
                                ? STRESS_BALANCE_WHY_RECOMMENDED
                                : group.match_reason ?? `This group focuses on ${group.focus.replace(/_/g, ' ')} and matches your intake.`}
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {group.name === STRESS_BALANCE_GROUP_NAME
                                ? STRESS_BALANCE_ALIGNMENT.map((item) => (
                                    <li key={item} className="flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))
                                : (
                                  <>
                                    {group.primary_concern && (
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        Similar primary concerns around {group.primary_concern.toLowerCase()}
                                      </li>
                                    )}
                                    {group.life_impact_areas && group.life_impact_areas.length > 0 && (
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        Shared focus on {group.life_impact_areas.slice(0, 3).join(', ')}
                                      </li>
                                    )}
                                    <li className="flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                      Matching emotional intensity level
                                    </li>
                                  </>
                                )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="growth" className="mt-0">
                <GrowthGarden />
              </TabsContent>

              <TabsContent value="upcoming" className="mt-0">
                <UpcomingTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <Card className="border-dashed border-border/60 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="text-muted-foreground/40 mb-4">
          {icon}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}
