import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Sparkles, ArrowLeft, Calendar, CreditCard, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { chatApi, schedulingApi } from '@/lib/api';
import type { ChatMessage as ChatMessageType } from '@/lib/api';

const CONSENT_STORAGE_KEY = 'sage_chat_consent';

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm here to help you find the right support group. This is a safe space where you can share openly. Everything you tell me is confidential and will only be used to match you with others who understand what you're going through.\n\nTo start, could you tell me a bit about what's been on your mind lately?",
  timestamp: new Date().toISOString(),
};

export default function Chat() {
  const [consentGiven, setConsentGiven] = useState(() =>
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(CONSENT_STORAGE_KEY) === '1' : false
  );
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [showingWaiting, setShowingWaiting] = useState(false);
  const [groupMatch, setGroupMatch] = useState<{
    group_id: string;
    group_name: string;
    group_focus: string;
    match_reason: string | null;
  } | null>(null);
  const [hasScheduledSlot, setHasScheduledSlot] = useState(false);
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When matched, show waiting message first then group card after delay
  useEffect(() => {
    if (intakeComplete && groupMatch && showingWaiting) {
      const t = setTimeout(() => setShowingWaiting(false), 2200);
      return () => clearTimeout(t);
    }
  }, [intakeComplete, groupMatch, showingWaiting]);

  // Check if user has a scheduled slot (enable Payment only then)
  useEffect(() => {
    if (!intakeComplete || !groupMatch) return;
    let cancelled = false;
    schedulingApi.slots()
      .then((slots) => { if (!cancelled) setHasScheduledSlot(Array.isArray(slots) && slots.length > 0); })
      .catch(() => { if (!cancelled) setHasScheduledSlot(false); });
    return () => { cancelled = true; };
  }, [intakeComplete, groupMatch]);

  const acceptConsent = () => {
    sessionStorage.setItem(CONSENT_STORAGE_KEY, '1');
    setConsentGiven(true);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const res = await chatApi.send(content);
      const aiMessage: ChatMessageType = {
        id: res.turn_id,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (res.intake_complete && res.group_id && res.group_name) {
        setIntakeComplete(true);
        setShowingWaiting(true);
        setGroupMatch({
          group_id: res.group_id,
          group_name: res.group_name,
          group_focus: res.group_focus ?? '',
          match_reason: res.match_reason ?? null,
        });
        toast({
          title: 'You\'re matched to a group',
          description: res.group_name,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartConfirm = async () => {
    setIsRestarting(true);
    try {
      await chatApi.restart();
      setIntakeComplete(false);
      setShowingWaiting(false);
      setGroupMatch(null);
      setHasScheduledSlot(false);
      setMessages([WELCOME_MESSAGE]);
      setRestartDialogOpen(false);
      toast({ title: 'Session restarted', description: 'You can start a new intake conversation.' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to restart';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsRestarting(false);
    }
  };

  if (!consentGiven) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <Card className="shadow-soft">
            <CardContent className="p-6 lg:p-8 space-y-5">
              <h2 className="text-xl font-serif text-foreground">Before we begin</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This intake chat is confidential. What you share will be used only to match you with a support group and to help your facilitator prepare. It will not be shared with other group members. By continuing, you agree to use this tool for its intended purpose and to seek emergency help (e.g. 988) if you are in crisis.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={acceptConsent} className="gap-2">
                  I agree, continue
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  Back to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* Chat header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-serif text-foreground">Your Intake Session</h1>
              <p className="text-muted-foreground text-sm">Take your time — this is your space</p>
            </div>
          </div>
        </div>

        {/* Messages container */}
        <Card className="flex-1 overflow-hidden shadow-soft">
          <CardContent className="h-full flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start animate-message-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-ai flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-chat-ai rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {intakeComplete && showingWaiting && (
                <div className="rounded-xl border border-border bg-card p-5 animate-fade-in flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
                  <p className="text-foreground font-medium">
                    We have enough information. We&apos;re finding a support group for you…
                  </p>
                </div>
              )}
              {intakeComplete && groupMatch && !showingWaiting && (
                <div className="rounded-xl border border-border bg-card p-5 animate-fade-in space-y-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">You&apos;re matched to a group</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-lg text-foreground">{groupMatch.group_name}</p>
                    {groupMatch.group_focus && (
                      <p className="text-sm text-muted-foreground">{groupMatch.group_focus}</p>
                    )}
                    {groupMatch.match_reason && (
                      <p className="text-xs text-muted-foreground italic">{groupMatch.match_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={() => navigate('/schedule')} size="sm" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      Schedule session
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                      disabled
                      title="Complete scheduling first"
                    >
                      <CreditCard className="w-3 h-3" />
                      Payment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground"
                      onClick={() => setRestartDialogOpen(true)}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restart session
                    </Button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-border p-4 bg-card/50">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading || intakeComplete}
              />
            </div>
          </CardContent>
        </Card>

        <Dialog open={restartDialogOpen} onOpenChange={setRestartDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restart session?</DialogTitle>
              <DialogDescription>
                Are you sure you want to start over? Your current progress will be cleared and you&apos;ll begin a new intake.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestartDialogOpen(false)} disabled={isRestarting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRestartConfirm} disabled={isRestarting}>
                {isRestarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Restarting…
                  </>
                ) : (
                  'Yes, start over'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
