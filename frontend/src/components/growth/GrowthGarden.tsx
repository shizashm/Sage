import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GardenIllustration } from './GardenIllustration';
import { GrowthActionCard } from './GrowthActionCard';
import { 
  PenLine, 
  Heart, 
  MessageCircle, 
  Sparkles,
  X
} from 'lucide-react';

// Mock data - in a real app, this would come from the backend
const mockGrowthData = {
  growthStage: 1, // 0-50 (grows indefinitely into a garden)
  totalMoments: 1,
  lastVisit: '2 days ago',
};

type ActionType = 'journal' | 'self' | 'reflect' | 'note' | null;

export function GrowthGarden() {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [entryText, setEntryText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [growthStage, setGrowthStage] = useState(mockGrowthData.growthStage);

  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action);
    setEntryText('');
    setShowConfirmation(false);
  };

  const handleSave = () => {
    if (entryText.trim()) {
      // In a real app, save to backend
      setShowConfirmation(true);
      setGrowthStage((prev) => prev + 1); // No limit - garden keeps growing
      
      // Reset after showing confirmation
      setTimeout(() => {
        setSelectedAction(null);
        setEntryText('');
        setShowConfirmation(false);
      }, 3000);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setEntryText('');
    setShowConfirmation(false);
  };

  const getPlaceholder = () => {
    switch (selectedAction) {
      case 'journal':
        return "What's on your mind today?";
      case 'self':
        return "Something about yourself you'd like to remember...";
      case 'reflect':
        return "A thought from a recent session...";
      case 'note':
        return "A small note for yourself...";
      default:
        return "";
    }
  };

  const getActionTitle = () => {
    switch (selectedAction) {
      case 'journal':
        return "Journal entry";
      case 'self':
        return "Something about you";
      case 'reflect':
        return "Session reflection";
      case 'note':
        return "A note to yourself";
      default:
        return "";
    }
  };

  // Show confirmation state - calm and minimal
  if (showConfirmation) {
    return (
      <div className="space-y-8 py-8">
        <GardenIllustration growthStage={growthStage} className="py-4" />
        
        <div className="text-center space-y-3 px-4">
          <p className="text-foreground/80 text-sm">
            You added another moment of care
          </p>
          <p className="text-muted-foreground/70 text-xs">
            Your support space is growing
          </p>
        </div>
      </div>
    );
  }

  // Show entry form when action is selected
  if (selectedAction) {
    return (
      <Card className="border-border/30 bg-background/50 shadow-none">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/70">{getActionTitle()}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 text-muted-foreground/60 hover:text-foreground/70"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder={getPlaceholder()}
            className="min-h-[100px] resize-none bg-background/30 border-border/30 focus:border-border/50 text-sm"
          />
          
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground/50">
              Only you can see this
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground/60 text-xs"
              >
                Maybe later
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={!entryText.trim()}
                className="text-foreground/70 text-xs"
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default garden view - calm and centered
  return (
    <div className="space-y-10 py-4">
      {/* Garden visualization */}
      <div className="text-center space-y-6">
        <GardenIllustration growthStage={growthStage} className="py-2" />
        
        <div className="space-y-2 px-4">
          <p className="text-foreground/70 text-sm">
            Your support space is growing
          </p>
          <p className="text-muted-foreground/60 text-xs leading-relaxed">
            There's no rush — growth continues when you return.
          </p>
        </div>
      </div>

      {/* Optional actions - understated */}
      <div className="space-y-3 pt-2">
        <p className="text-xs text-muted-foreground/50 px-1">
          If you'd like to add something today
        </p>
        
        <div className="grid gap-2">
          <GrowthActionCard
            icon={<PenLine className="w-4 h-4" />}
            title="Write a journal entry"
            description="Whatever comes to mind"
            onClick={() => handleActionSelect('journal')}
          />
          
          <GrowthActionCard
            icon={<Heart className="w-4 h-4" />}
            title="Add something about yourself"
            description="Something you'd like to remember"
            onClick={() => handleActionSelect('self')}
          />
          
          <GrowthActionCard
            icon={<MessageCircle className="w-4 h-4" />}
            title="Reflect on a session"
            description="A thought that stayed with you"
            onClick={() => handleActionSelect('reflect')}
          />
          
          <GrowthActionCard
            icon={<Sparkles className="w-4 h-4" />}
            title="Leave a note for yourself"
            description="Something kind"
            onClick={() => handleActionSelect('note')}
          />
        </div>
        
        <p className="text-xs text-muted-foreground/40 text-center pt-6">
          Or simply close this space — that's okay too.
        </p>
      </div>
    </div>
  );
}
