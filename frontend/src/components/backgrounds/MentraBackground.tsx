import { cn } from '@/lib/utils';

interface MentraBackgroundProps {
  variant: 'hero' | 'mid' | 'cta';
  className?: string;
}

export function MentraBackground({ variant, className }: MentraBackgroundProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {variant === 'hero' && <HeroBackground />}
      {variant === 'mid' && <MidBackground />}
      {variant === 'cta' && <CtaBackground />}
    </div>
  );
}

function HeroBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M-100 600 Q200 400 100 200 Q0 0 300 -100"
        stroke="hsl(160 35% 40% / 0.04)"
        strokeWidth="120"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M1200 900 Q1400 600 1300 300 Q1200 100 1500 -50"
        stroke="hsl(160 35% 40% / 0.03)"
        strokeWidth="180"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M400 950 Q600 700 700 500 Q800 300 650 100"
        stroke="hsl(160 30% 45% / 0.025)"
        strokeWidth="200"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M900 850 Q1000 600 950 400 Q900 200 1100 50"
        stroke="hsl(160 25% 50% / 0.02)"
        strokeWidth="80"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MidBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M-50 700 Q150 500 100 300 Q50 100 200 -50"
        stroke="hsl(160 35% 40% / 0.035)"
        strokeWidth="140"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M800 800 Q900 550 850 350 Q800 150 950 0"
        stroke="hsl(160 30% 45% / 0.03)"
        strokeWidth="160"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M1300 750 Q1400 500 1350 250 Q1300 50 1500 -100"
        stroke="hsl(160 35% 40% / 0.025)"
        strokeWidth="100"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M300 850 Q450 600 400 400 Q350 200 500 50"
        stroke="hsl(160 25% 50% / 0.02)"
        strokeWidth="120"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CtaBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 650 Q200 400 150 200 Q100 50 250 -100"
        stroke="hsl(0 0% 100% / 0.06)"
        strokeWidth="150"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M600 700 Q750 450 700 250 Q650 100 800 -50"
        stroke="hsl(0 0% 100% / 0.04)"
        strokeWidth="180"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M1100 650 Q1250 400 1200 200 Q1150 50 1350 -100"
        stroke="hsl(0 0% 100% / 0.05)"
        strokeWidth="130"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M350 600 Q400 350 350 150 Q300 0 450 -100"
        stroke="hsl(0 0% 100% / 0.03)"
        strokeWidth="100"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M950 580 Q1000 350 950 180 Q900 50 1050 -80"
        stroke="hsl(0 0% 100% / 0.025)"
        strokeWidth="80"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default MentraBackground;
