'use client';

import { useAuth } from '@/lib/auth-context';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageSquareDashed } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Sidebar — always visible on desktop, full-width on mobile */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
        <ConversationList currentUserId={user.id} />
      </aside>

      {/* Empty state panel — hidden on mobile (user goes directly to a conversation) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center">
          <MessageSquareDashed className="w-8 h-8 text-brand-500" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white">Select a conversation</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Choose a conversation from the list, or start one from a job application.
          </p>
        </div>
      </div>
    </>
  );
}
