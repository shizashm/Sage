import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, Users, ArrowRight, PartyPopper, Loader2 } from 'lucide-react';
import { groupsApi, schedulingApi } from '@/lib/api';
import { format } from 'date-fns';

function matchReasonWithoutLifeImpact(text: string | null): string | null {
  if (!text) return null;
  return text.replace(/\s*;?\s*life impact:\s*\[[^\]]*\].?/i, '').trim() || null;
}

export default function Success() {
  const [group, setGroup] = useState<{ id: string; name: string; focus: string; match_reason: string | null; life_impact_areas?: string[] | null } | null>(null);
  const [slot, setSlot] = useState<{ id: string; slot_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [groupRes, slots] = await Promise.all([
          groupsApi.my(),
          schedulingApi.slots().catch(() => []),
        ]);
        if (!cancelled) {
          setGroup(groupRes ?? null);
          const next = Array.isArray(slots) && slots.length > 0
            ? slots.sort((a, b) => new Date(a.slot_at).getTime() - new Date(b.slot_at).getTime())[0]
            : null;
          setSlot(next ?? null);
        }
      } catch {
        if (!cancelled) setGroup(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppLayout>
      <div className="flex min-h-full flex-col justify-center">
        <div className="max-w-lg mx-auto text-center animate-fade-in">
          <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto animate-breathe">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="w-8 h-8 text-warning" />
          </div>
        </div>

        <h1 className="text-3xl font-serif text-foreground mb-3">
          You're All Set!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your spot in the group is confirmed. We're excited to have you.
        </p>

          {loading ? (
            <Card className="shadow-soft-lg text-left mb-8">
              <CardContent className="p-6 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading details…</span>
              </CardContent>
            </Card>
          ) : (
          <Card className="shadow-soft-lg text-left mb-8">
            <CardContent className="p-6 space-y-4">
              {slot && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {format(new Date(slot.slot_at), 'EEEE, MMMM d')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(slot.slot_at), 'h:mm a')} (90 min)
                    </p>
                  </div>
                </div>
              )}
              {group && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.focus}</p>
                    {(() => {
                      const reason = matchReasonWithoutLifeImpact(group.match_reason ?? null);
                      return reason ? <p className="text-xs text-muted-foreground italic mt-1">{reason}</p> : null;
                    })()}
                    {group.life_impact_areas && group.life_impact_areas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {group.life_impact_areas.map((area) => (
                          <Badge key={area} variant="secondary" className="font-normal text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!group && !slot && (
                <p className="text-muted-foreground text-sm">Your confirmed group and session details will appear here.</p>
              )}
            </CardContent>
          </Card>
          )}

          <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-foreground mb-4">What happens next?</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                1
              </span>
              <span className="text-muted-foreground">
                You'll receive an email with the session link and preparation tips
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                2
              </span>
              <span className="text-muted-foreground">
                Join 10 minutes early to settle in and meet others
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-shrink-0">
                3
              </span>
              <span className="text-muted-foreground">
                Your therapist will guide the session — just bring yourself
              </span>
            </li>
          </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/my-group">View Group Details</Link>
            </Button>
            <Button asChild size="lg" className="gap-2">
              <Link to="/chat">
                Start Another Session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
