import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GrowthGarden } from '@/components/growth/GrowthGarden';
import { UpcomingTab } from '@/components/upcoming/UpcomingTab';
import { intakeApi, schedulingApi, type IntakeResponse } from '@/lib/api';
import { groupsApi, type GroupResponse } from '@/lib/api';
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
} from 'lucide-react';

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

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showChatInstructions, setShowChatInstructions] = useState(false);
  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [hasSlots, setHasSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [intakeRes, groupRes, slots] = await Promise.all([
          intakeApi.get(),
          groupsApi.my(),
          schedulingApi.slots().catch(() => []),
        ]);
        if (!cancelled) {
          setIntake(intakeRes);
          setGroup(groupRes);
          setHasSlots(Array.isArray(slots) && slots.length > 0);
        }
      } catch {
        if (!cancelled) {
          setIntake(null);
          setGroup(null);
          setHasSlots(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
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
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {/* Greeting + status */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Welcome</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-serif text-foreground">{firstName}</h1>
              {statusCopy && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {statusCopy}
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium text-foreground">Ready to talk?</h2>
                  <p className="text-sm text-muted-foreground">Start your conversation whenever you're ready.</p>
                </div>
                <Button 
                  onClick={() => setShowChatInstructions(true)} 
                  size="lg"
                  className="shrink-0 gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat instructions dialog (same content as chatinstructions page) */}
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

          {/* Secondary Navigation Tabs */}
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
              {/* My Summary Tab */}
              <TabsContent value="summary" className="mt-0 space-y-6">
                {loading ? (
                  <Card className="border-dashed border-border/60 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading your summary…</p>
                    </CardContent>
                  </Card>
                ) : !hasIntake ? (
                  <EmptyState
                    icon={<FileText className="w-12 h-12" />}
                    message="Start a chat to get your personalized summary. Your reflection, primary concern, and goals will appear here once you've completed the conversation."
                  />
                ) : (
                  <>
                    {intake?.contextual_background && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-foreground">Summary</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {intake.contextual_background}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {intake?.primary_concern && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-foreground">Primary Concern</h3>
                          </div>
                          <p className="text-foreground">{intake.primary_concern}</p>
                        </CardContent>
                      </Card>
                    )}
                    {(intake?.emotional_intensity != null && intake.emotional_intensity >= 0) && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-foreground">How you're feeling</h3>
                            <Badge variant="secondary" className="font-normal">
                              {emotionalDisplay.level}
                            </Badge>
                          </div>
                          <Progress value={emotionalDisplay.value} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-3">
                            This reflects the emotional weight of what you shared — not a score or diagnosis.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {impactAreas.length > 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-medium text-foreground mb-4">Areas of Impact</h3>
                          <div className="flex flex-wrap gap-2">
                            {impactAreas.map((area) => (
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
                    )}
                    {supportGoalsList.length > 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-foreground">What you're hoping for</h3>
                          </div>
                          <ul className="space-y-3">
                            {supportGoalsList.map((goal) => (
                              <li key={goal} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* My Group Tab */}
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
                  <>
                    <Card>
                      <CardContent className="p-6 space-y-5">
                        <div>
                          <h3 className="text-lg font-medium text-foreground">{group.name}</h3>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {group.focus}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    {group.match_reason && (
                      <Card>
                        <CardContent className="p-6 space-y-4">
                          <h3 className="font-medium text-foreground">Why this group was recommended</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {group.match_reason}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    <Button
                      onClick={() => navigate('/schedule')}
                      size="lg"
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Choose Schedule
                    </Button>
                  </>
                )}
              </TabsContent>

              {/* Growth Tab */}
              <TabsContent value="growth" className="mt-0">
                <GrowthGarden />
              </TabsContent>

              {/* Upcoming Tab */}
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
