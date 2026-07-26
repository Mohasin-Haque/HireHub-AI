'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { OnlineBadge } from './OnlineBadge';
import { getConversations, getConversationParticipants } from '@/lib/actions/shared';
import { createClient } from '@/lib/supabase/client';
import type { ConversationPreview, ChatParticipant } from '@/lib/chat-types';

interface ConversationItem {
  id: string;
  updatedAt: string;
  lastMessage: string;
  lastSenderId: string;
  other: ChatParticipant | null;
  unread: boolean;
}

interface ConversationListProps {
  currentUserId: string;
  onNewChat?: () => void;
}

export function ConversationList({ currentUserId, onNewChat }: ConversationListProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const raw = (await getConversations()) as unknown as ConversationPreview[];
    const enriched = await Promise.all(
      raw.map(async (row) => {
        const convRaw = row.conversations;
        const conv = Array.isArray(convRaw) ? convRaw[0] : convRaw;
        if (!conv) return null;
        const participants = (await getConversationParticipants(conv.id)) as unknown as ChatParticipant[];
        const other = participants.find((p) => p.user_id !== currentUserId) ?? null;
        const myParticipant = participants.find((p) => p.user_id === currentUserId);
        const msgs = conv.messages ?? [];
        const lastMsg = msgs[msgs.length - 1];
        const unread =
          !!lastMsg &&
          lastMsg.sender_id !== currentUserId &&
          (!myParticipant?.last_read_at ||
            new Date(lastMsg.created_at) > new Date(myParticipant.last_read_at));
        return {
          id: conv.id,
          updatedAt: conv.updated_at,
          lastMessage: lastMsg?.body ?? '',
          lastSenderId: lastMsg?.sender_id ?? '',
          other,
          unread,
        } satisfies ConversationItem;
      })
    );
    setItems(enriched.filter(Boolean) as ConversationItem[]);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh list when any conversation updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('conv-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  // Presence tracking
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('online-users', { config: { presence: { key: currentUserId } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  const filtered = items.filter((item) => {
    if (!search) return true;
    const profilesRaw = item.other?.profiles;
    const profiles = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
    const name = profiles?.full_name?.toLowerCase() ?? '';
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            Messages
          </h2>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="p-1.5 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {search ? 'No conversations match your search' : 'No conversations yet'}
            </p>
            {!search && (
              <p className="text-xs text-slate-400">
                Start a conversation from a job application or candidate profile.
              </p>
            )}
          </div>
        ) : (
          <ul className="p-2 space-y-0.5">
            {filtered.map((item) => {
              const isActive = pathname === `/dashboard/messages/${item.id}`;
              const isOnline = onlineUsers.has(item.other?.user_id ?? '');
              const profilesRaw = item.other?.profiles;
              const profile = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
              const name = profile?.full_name ?? 'Unknown User';
              const avatar = profile?.avatar_url;
              const headline = profile?.headline;

              return (
                <li key={item.id}>
                  <Link
                    href={`/dashboard/messages/${item.id}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name[0]?.toUpperCase()
                        )}
                      </div>
                      <OnlineBadge isOnline={isOnline} className="bottom-0 right-0" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn('text-sm truncate', item.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300')}>
                          {name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {item.updatedAt ? formatDate(item.updatedAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className={cn('text-xs truncate', item.unread ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400')}>
                          {headline && !item.lastMessage ? headline : (item.lastMessage || 'No messages yet')}
                        </p>
                        {item.unread && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
