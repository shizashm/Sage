import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/api';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 animate-message-in',
        isAI ? 'justify-start' : 'justify-end',
        isLatest && 'opacity-0'
      )}
      style={isLatest ? { animation: 'messageIn 0.3s ease-out 0.1s forwards' } : undefined}
    >
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-ai flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-2xl',
          isAI
            ? 'bg-chat-ai text-chat-ai-foreground rounded-tl-md'
            : 'bg-chat-user text-chat-user-foreground rounded-tr-md'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-2',
            isAI ? 'text-muted-foreground' : 'text-chat-user-foreground/70'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
