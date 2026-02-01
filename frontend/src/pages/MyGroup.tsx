import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Sparkles, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { groupsApi } from '@/lib/api';

// Mock until we have real leader and member count from backend
const MOCK_LEADER = 'Dr. Sarah Chen';
const MOCK_MEMBER_COUNT = 5;
const MOCK_SPOTS_LEFT = 3;

export default function MyGroup() {
  const navigate = useNavigate();
  const [group, setGroup] = useState<{
    id: string;
    name: string;
    focus: string;
    match_reason: string | null;
    primary_concern?: string | null;
    life_impact_areas?: string[] | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    groupsApi.my()
      .then((g) => { if (!cancelled) setGroup(g ?? null); })
      .catch(() => { if (!cancelled) setGroup(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven&apos;t been matched to a group yet. Complete your intake chat to get matched.</p>
              <Button asChild>
                <Link to="/chat">Go to Chat</Link>
              </Button>
              <Button variant="outline" className="ml-2" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Your Group Match</h1>
            <p className="text-muted-foreground mt-1">
              We found a supportive community for you
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
        </div>

        {/* Group Card - real data + mocked leader/members */}
        <Card className="shadow-soft-lg overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {group.focus}
                </Badge>
                <h2 className="text-2xl font-serif text-foreground">{group.name}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  A supportive community for {group.focus.replace(/_/g, ' ')} — shared focus and a licensed therapist to guide sessions.
                </p>
                {group.life_impact_areas && group.life_impact_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {group.life_impact_areas.map((area) => (
                      <Badge key={area} variant="secondary" className="font-normal">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {MOCK_MEMBER_COUNT} members
                  </span>
                  <span>({MOCK_SPOTS_LEFT} spots left)</span>
                  <span>Led by <strong className="text-foreground">{MOCK_LEADER}</strong></span>
                </div>
              </div>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>
        </Card>

        {/* Why This Group - built from real intake data */}
        <Card className="shadow-soft border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Why this group was recommended
                </h3>
                {(() => {
                  const concern = group.primary_concern ?? 'your concerns';
                  const areas = group.life_impact_areas && group.life_impact_areas.length > 0
                    ? group.life_impact_areas.join(', ')
                    : 'daily life';
                  const focusLabel = group.focus.replace(/_/g, ' ');
                  const hasRealData = group.primary_concern || (group.life_impact_areas && group.life_impact_areas.length > 0);
                  return (
                    <>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        {hasRealData
                          ? `Based on your intake, you mentioned ${concern.toLowerCase()} affecting ${areas}. This group focuses on ${focusLabel} and includes others working on similar challenges.`
                          : `This group focuses on ${focusLabel} and matches the focus area from your intake.`}
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {group.primary_concern && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            Similar primary concerns around {group.primary_concern.toLowerCase()}
                          </li>
                        )}
                        {group.life_impact_areas && group.life_impact_areas.length > 0 && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            Shared focus on areas like {group.life_impact_areas.slice(0, 3).join(', ')}
                          </li>
                        )}
                      </ul>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/schedule">Schedule session</Link>
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
