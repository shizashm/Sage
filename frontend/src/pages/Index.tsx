import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Users,
  Brain,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
} from 'lucide-react';
import heroImage from '@/assets/hero-abstract.jpg';
import { MentraBackground } from '@/components/backgrounds/MentraBackground';

const features = [
  {
    icon: MessageCircle,
    title: 'Compassionate AI Intake',
    description:
      'Share your story at your own pace with our empathetic AI assistant. No judgment, no rush.',
  },
  {
    icon: Brain,
    title: 'Intelligent Matching',
    description:
      'Our AI analyzes your needs to find peers with similar experiences and therapists who specialize in your concerns.',
  },
  {
    icon: Users,
    title: 'Supportive Group Sessions',
    description:
      'Connect with others who truly understand, guided by licensed professionals in a safe space.',
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    description:
      'Your data is encrypted and never sold. AI assists the process, but humans make all care decisions.',
  },
];

const steps = [
  { number: 1, title: 'Share your story', description: "Chat with our AI to express what you're going through" },
  { number: 2, title: 'Get matched', description: 'We find the perfect group and therapist for your needs' },
  { number: 3, title: 'Choose your time', description: 'Pick a session that fits your schedule' },
  { number: 4, title: 'Begin healing', description: 'Join your group and start your journey together' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-serif text-primary">Sage</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <MentraBackground variant="hero" className="z-0" />
        {/* Background layers */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        
        {/* Decorative blurs */}
        <div className="absolute top-10 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-assisted group therapy matching
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Find your community.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Begin your healing.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Sage uses AI to understand your unique needs and connects you with the right support group and licensed therapist — so you never have to heal alone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/signup">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                'Free intake assessment',
                'Licensed therapists',
                'HIPAA compliant',
              ].map((item) => (
                <span key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 overflow-hidden">
        <MentraBackground variant="mid" className="z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm text-secondary-foreground mb-4">
              <ArrowRight className="w-4 h-4" />
              Simple process
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-4">
              How Sage Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A simple, guided journey from sharing your story to finding your community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 overflow-hidden">
        <MentraBackground variant="mid" className="z-0" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              Why choose us
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-4">
              Why Choose Sage?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We combine the power of AI with the expertise of licensed professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 shadow-soft hover:shadow-soft-lg transition-all duration-300"
                >
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <MentraBackground variant="cta" className="z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-primary-foreground mb-4">
              You don't have to do this alone
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
              Take the first step towards connecting with others who understand.
              Your journey to healing starts with a simple conversation.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 text-base px-8 shadow-lg hover:shadow-xl transition-all">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif text-primary">Sage</h1>
              <span className="text-sm text-muted-foreground">
                © 2026 All rights reserved
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Your data is private and secure</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
