'use client';

import { cn, formatDate } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '@/lib/chat-types';

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isRead: boolean;
  showAvatar: boolean;
  avatarUrl?: string | null;
  senderName?: string;
}

export function MessageBubble({
  message,
  isMine,
  isRead,
  showAvatar,
  avatarUrl,
  senderName,
}: MessageBubbleProps) {
  return (
    <div className={cn('flex items-end gap-2 px-4 group', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar placeholder — keeps alignment even when hidden */}
      <div className="w-7 h-7 shrink-0">
        {showAvatar && !isMine && (
          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={senderName || ''} className="w-full h-full object-cover" />
            ) : (
              (senderName?.[0] || '?').toUpperCase()
            )}
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-0.5 max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
        {showAvatar && !isMine && senderName && (
          <span className="text-[10px] font-semibold text-slate-400 px-1">{senderName}</span>
        )}

        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
            isMine
              ? 'bg-brand-600 text-white rounded-br-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
          )}
        >
          {message.body}
        </div>

        {message.attachment_url && (
          <div className="mt-2">
            {message.attachment_type?.startsWith('image/') ? (
              <a href={message.attachment_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={message.attachment_url}
                  alt={message.attachment_name || 'Attachment'}
                  className="max-w-xs rounded-lg"
                />
              </a>
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
              >
                {message.attachment_name || 'View Attachment'}
              </a>
            )}
          </div>
        )}

        <div className={cn('flex items-center gap-1 px-1', isMine ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatDate(message.created_at)}
          </span>
          {isMine && (
            <span className="text-[10px] text-slate-400">
              {isRead ? (
                <CheckCheck className="w-3 h-3 text-brand-400" />
              ) : (
                <Check className="w-3 h-3 text-slate-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
