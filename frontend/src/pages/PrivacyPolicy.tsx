import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Heart, Lock, Users, Brain, Mail, CheckCircle2, XCircle } from 'lucide-react';

function ValuesSection() {
  return (
    <>
      <p>
        At Sage, we believe that seeking support should feel safe. Your journey toward 
        healing is deeply personal, and we treat your information with the same care and 
        respect that we hope you find in your therapy groups.
      </p>
      <p>
        This policy explains how we handle your information in plain, honest language—because 
        you deserve to understand exactly what happens with your data without needing a law degree.
      </p>
    </>
  );
}

function CollectedSection() {
  const items = [
    { label: 'Account information', desc: 'Your name, email, and password to create your account' },
    { label: 'Intake responses', desc: 'What you share during your AI-guided intake conversation' },
    { label: 'Session preferences', desc: 'Your scheduling and group preferences' },
    { label: 'Payment details', desc: 'Processed securely—we never store your full card number' },
  ];

  return (
    <>
      <p className="mb-4">We only collect information that helps us connect you with the right support:</p>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground"> — {item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function UsageSection() {
  const items = [
    { title: 'Matching you thoughtfully', desc: 'Finding groups and therapists that fit your needs' },
    { title: 'Coordinating your care', desc: 'Sharing context with your therapist to support you better' },
    { title: 'Improving our service', desc: 'Using anonymized data to make Sage better for everyone' },
    { title: 'Keeping you informed', desc: 'Sending session reminders and important updates' },
  ];

  return (
    <>
      <p className="mb-4">Every piece of information we collect serves a clear purpose:</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.title} className="p-4 rounded-xl border border-border bg-card">
            <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function NeverSection() {
  const items = [
    { text: 'We do not sell your data.', sub: 'Ever. To anyone. For any reason.' },
    { text: 'We do not show you ads.', sub: 'Your healing space is not a marketplace.' },
    { text: 'We do not train AI on your private conversations.', sub: 'What you share stays yours.' },
    { text: 'We do not share without consent', sub: '(except when legally required for safety).' },
  ];

  return (
    <>
      <p className="mb-4 font-medium">We believe in being crystal clear about boundaries:</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground">{item.text}</span>
              <span className="text-muted-foreground"> {item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TherapistSection() {
  const items = [
    "You'll see exactly what information will be shared before joining",
    "You explicitly consent to sharing—it's never automatic",
    'Your therapist is bound by professional confidentiality standards',
    'You can request to see what has been shared at any time',
  ];

  return (
    <>
      <p className="mb-4">
        When you join a therapy group, your therapist needs context to support you effectively:
      </p>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <span className="text-foreground">{item}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RightsSection() {
  const items = [
    { title: 'Access', desc: 'See all information we have about you' },
    { title: 'Correct', desc: 'Update any inaccurate information' },
    { title: 'Delete', desc: 'Request removal of your data' },
    { title: 'Export', desc: 'Download a copy in readable format' },
    { title: 'Withdraw', desc: 'Change your consent preferences' },
  ];

  return (
    <>
      <p className="mb-4">Your data belongs to you. You have the right to:</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.title} className="p-4 rounded-xl bg-secondary/50 border border-border">
            <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        To exercise any of these rights, simply reach out to us—we'll respond within 30 days.
      </p>
    </>
  );
}

function AISection() {
  const items = [
    'AI guides conversations and helps match you—but humans make all care decisions',
    'AI is not a therapist and cannot provide clinical advice or diagnosis',
    'In crisis situations, AI will direct you to appropriate emergency resources',
    'Your conversations with AI are encrypted and stored securely',
  ];

  return (
    <>
      <p className="mb-4">
        Our AI assistant helps with the intake process, but it's important you understand its boundaries:
      </p>
      <div className="p-5 rounded-2xl bg-secondary/30 border border-border">
        <div className="grid gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                {i + 1}
              </div>
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ContactSection() {
  return (
    <>
      <p className="mb-4">
        We're here to help. If you have any questions about this policy or how we handle your information:
      </p>
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">privacy@sage.com</p>
            <p className="text-sm text-muted-foreground">We respond to all inquiries within 48 hours</p>
          </div>
        </div>
      </div>
    </>
  );
}

const sections = [
  {
    id: 'values',
    icon: Heart,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Our Values & Commitment',
    Component: ValuesSection,
  },
  {
    id: 'collected',
    icon: Lock,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'What We Collect',
    Component: CollectedSection,
  },
  {
    id: 'usage',
    icon: Users,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'How We Use Your Information',
    Component: UsageSection,
  },
  {
    id: 'never',
    icon: Shield,
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
    title: 'What We Will Never Do',
    highlight: true,
    Component: NeverSection,
  },
  {
    id: 'therapist',
    icon: Users,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Sharing With Your Therapist',
    Component: TherapistSection,
  },
  {
    id: 'rights',
    icon: Lock,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Your Rights & Control',
    Component: RightsSection,
  },
  {
    id: 'ai',
    icon: Brain,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'About Our AI',
    Component: AISection,
  },
  {
    id: 'contact',
    icon: Mail,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Questions or Concerns?',
    Component: ContactSection,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-serif text-primary">Sage</h1>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container relative px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-6 border border-primary/20">
              <Shield className="w-4 h-4" />
              Your privacy matters to us
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              How we protect and respect your personal information
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="container px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const SectionContent = section.Component;
            return (
              <Card 
                key={section.id} 
                className={`overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 ${
                  section.highlight ? 'border-destructive/30' : ''
                }`}
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${section.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${section.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-xl lg:text-2xl font-semibold text-foreground">{section.title}</h2>
                    </div>
                  </div>
                  <div className="text-foreground/90 leading-relaxed space-y-4 pl-0 lg:pl-16">
                    <SectionContent />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Closing */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <Heart className="w-5 h-5 text-primary" />
              <p className="text-foreground font-medium">
                Thank you for trusting Sage with your journey. We don't take that lightly.
              </p>
            </div>
          </div>
        </div>
      </main>

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your data is private and secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
