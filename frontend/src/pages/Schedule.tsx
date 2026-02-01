import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { groupsApi, schedulingApi } from '@/lib/api';

const SESSION_DURATION_MIN = 90;

function formatSlotDate(dateString: string) {
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'long' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export default function Schedule() {
  const [group, setGroup] = useState<{ id: string; name: string; focus: string } | null>(null);
  const [slots, setSlots] = useState<{ id: string; slot_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [groupRes, slotsRes] = await Promise.all([
          groupsApi.my(),
          schedulingApi.slots(),
        ]);
        if (!cancelled) {
          setGroup(groupRes ?? null);
          setSlots(Array.isArray(slotsRes) ? slotsRes : []);
        }
      } catch {
        if (!cancelled) setGroup(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setIsConfirming(true);
    try {
      await schedulingApi.confirm(selectedSlot);
      toast({
        title: 'Session scheduled!',
        description: "You're all set. Let's complete the payment.",
      });
      navigate('/payment');
    } catch (e) {
      toast({
        title: 'Something went wrong',
        description: (e as Error)?.message ?? 'Could not confirm slot.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <p className="text-muted-foreground">No group assigned yet. Complete your intake chat to get matched, then you can schedule a session.</p>
          <Button asChild>
            <Link to="/chat">Go to Chat</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Choose Your Session</h1>
          <p className="text-muted-foreground mt-1">
            Group almost ready — select a time that works best for you
          </p>
        </div>

        {/* Matched group from chat */}
        <Card className="shadow-soft bg-muted/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground text-sm">{group.name}</p>
              <p className="text-xs text-muted-foreground">
                {group.focus} · {SESSION_DURATION_MIN}-minute group session
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time slots from API */}
        <div className="space-y-3">
          {slots.length === 0 ? (
            <p className="text-muted-foreground text-sm">No slots available yet. Please try again later.</p>
          ) : (
            slots.map((slot) => {
              const { day, date, time } = formatSlotDate(slot.slot_at);
              const isSelected = selectedSlot === slot.id;

              return (
                <Card
                  key={slot.id}
                  className={cn(
                    'shadow-soft transition-all cursor-pointer',
                    isSelected && 'ring-2 ring-primary border-primary',
                    !isSelected && 'hover:border-primary/50'
                  )}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex flex-col items-center justify-center text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{day}</p>
                          <p className="text-sm text-muted-foreground">{date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{SESSION_DURATION_MIN} min</p>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-border" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            disabled={!selectedSlot || isConfirming || slots.length === 0}
            onClick={handleConfirm}
            className="gap-2"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Selection
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
