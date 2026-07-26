'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getMessages,
  sendMessage,
  markMessagesRead,
  getConversationParticipants,
} from '@/lib/actions/shared';
import { createClient } from '@/lib/supabase/client';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { OnlineBadge } from '@/components/chat/OnlineBadge';
import type { ChatMessage, ChatParticipant } from '@/lib/chat-types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const { id: conversationId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const other = participants.find((p) => p.user_id !== user?.id) ?? null;
  const otherProfiles = other?.profiles;
  const otherProfile = Array.isArray(otherProfiles) ? otherProfiles[0] : otherProfiles;
  const otherName = otherProfile?.full_name ?? 'Unknown';
  const otherAvatar = otherProfile?.avatar_url ?? null;
  const otherHeadline = otherProfile?.headline ?? null;
  const isOtherOnline = onlineUsers.has(other?.user_id ?? '');

  // Determine read status: a message is "read" if the other participant's last_read_at is after it
  const otherParticipant = participants.find((p) => p.user_id !== user?.id);
  const otherLastRead = otherParticipant?.last_read_at
    ? new Date(otherParticipant.last_read_at)
    : null;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [msgs, parts] = await Promise.all([
      getMessages(conversationId) as unknown as Promise<ChatMessage[]>,
      getConversationParticipants(conversationId) as unknown as Promise<ChatParticipant[]>,
    ]);
    setMessages(msgs);
    setParticipants(parts);
    setLoading(false);
    await markMessagesRead(conversationId);
  }, [conversationId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading) scrollToBottom('instant');
  }, [loading, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime messages subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== user?.id) {
            markMessagesRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id]);

  // Realtime participant updates (for read receipts)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`parts:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          getConversationParticipants(conversationId).then((parts) =>
            setParticipants(parts as unknown as ChatParticipant[])
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Presence / online status
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase.channel(`presence:${conversationId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  // Typing indicator via broadcast
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, user]);

  const broadcastTyping = useCallback(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id },
    });
  }, [conversationId, user]);

  const handleSend = useCallback(
    async (
      body: string,
      attachment?: { url: string; type: string; name: string }
    ) => {
      await sendMessage(
        conversationId,
        body,
        attachment?.url,
        attachment?.type,
        attachment?.name
      );
    },
    [conversationId]
  );

  if (!user) return null;

  return (
    <>
      {/* Sidebar — hidden on mobile when in a conversation */}
      <aside className="hidden md:flex w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-col shrink-0">
        <ConversationList currentUserId={user.id} />
      </aside>

      {/* Conversation panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
              {otherAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
              ) : (
                otherName[0]?.toUpperCase()
              )}
            </div>
            <OnlineBadge isOnline={isOtherOnline} className="bottom-0 right-0" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{otherName}</p>
            <p className="text-xs text-slate-400 truncate">
              {isOtherOnline ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : otherHeadline ? (
                otherHeadline
              ) : (
                'Offline'
              )}
            </p>
          </div>

          <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {loading ? (
            <div className="space-y-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 animate-pulse ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div
                    className={`h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 ${i % 2 === 0 ? 'w-48' : 'w-64'}`}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Start the conversation with {otherName}
              </p>
              <p className="text-xs text-slate-400">
                Messages are private between you and {otherName}.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMine = msg.sender_id === user.id;
                const prevMsg = messages[idx - 1];
                const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                const isRead =
                  isMine && otherLastRead !== null
                    ? new Date(msg.created_at) <= otherLastRead
                    : false;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMine={isMine}
                    isRead={isRead}
                    showAvatar={showAvatar}
                    avatarUrl={isMine ? null : otherAvatar}
                    senderName={isMine ? undefined : otherName}
                  />
                );
              })}
            </>
          )}

          {otherTyping && <TypingIndicator name={otherName} />}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <MessageComposer onSend={handleSend} onTyping={broadcastTyping} conversationId={conversationId} />
      </div>
    </>
  );
}
