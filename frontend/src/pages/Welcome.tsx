import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Users, Heart, DoorOpen } from 'lucide-react';
export default function Welcome() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const handleBegin = () => {
    navigate('/chat');
  };
  const firstName = user?.name?.split(' ')[0] || 'there';
  return <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Greeting */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Welcome to Sage</p>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">
            Hi {firstName}
          </h1>
        </div>

        {/* Trust signals card */}
        <Card className="p-6 shadow-soft-lg border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium">Everything you share is private</p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium">A real therapist is involved</p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium">There's no rush, go at your own pace</p>
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium">You can leave anytime, no pressure</p>
            </div>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="space-y-4 pt-2">
          <p className="text-center text-muted-foreground leading-relaxed">
            There are no right or wrong answers here.<br />
            Share only what feels comfortable — <span className="text-foreground font-normal">you're always in control</span>.
          </p>
          <Button onClick={handleBegin} size="lg" className="w-full h-14 text-base font-medium shadow-soft">
            I'm ready, let's begin
          </Button>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
            I'm not ready yet
          </Link>
        </div>
      </div>
    </div>;
}