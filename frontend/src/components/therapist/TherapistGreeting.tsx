import { Card, CardContent } from '@/components/ui/card';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function TherapistGreeting() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10 shadow-sm">
      <CardContent className="py-8 px-6">
        <p className="text-sm font-medium text-primary/70 uppercase tracking-widest mb-2">
          {formattedDate}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground tracking-tight">
          {getGreeting()}, <span className="text-primary">Dr. Nadia</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base">
          Here's what your day looks like
        </p>
      </CardContent>
    </Card>
  );
}