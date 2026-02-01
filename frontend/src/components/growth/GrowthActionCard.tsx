import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GrowthActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export function GrowthActionCard({ 
  icon, 
  title, 
  description, 
  onClick,
  className 
}: GrowthActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg",
        "bg-transparent hover:bg-muted/20",
        "border border-transparent",
        "transition-colors duration-500",
        "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30",
        "group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors duration-500 mt-0.5">
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm text-foreground/60 group-hover:text-foreground/70 transition-colors duration-500">
            {title}
          </p>
          <p className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground/50 transition-colors duration-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
