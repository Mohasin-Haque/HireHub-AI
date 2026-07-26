'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadChatAttachment } from '@/lib/actions/chat';
import { toast } from 'sonner';

interface MessageComposerProps {
  onSend: (
    body: string,
    attachment?: { url: string; type: string; name: string }
  ) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
  conversationId: string;
}

export function MessageComposer({
  onSend,
  onTyping,
  disabled,
  conversationId,
}: MessageComposerProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    if (onTyping) {
      onTyping();
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {}, 2000);
    }
  };

  const handleSend = useCallback(
    async (attachment?: { url: string; type: string; name: string }) => {
      const trimmed = body.trim();
      if (!trimmed && !attachment) return;

      setSending(true);
      setBody('');
      try {
        await onSend(trimmed, attachment);
      } finally {
        setSending(false);
      }
    },
    [body, onSend]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSending(true);
    const toastId = toast.loading('Uploading attachment...');
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      const attachment = await uploadChatAttachment(formData, conversationId);
      await handleSend(attachment);
      toast.success('Attachment sent!', { id: toastId });
    } catch (err) {
      toast.error((err as Error).message, { id: toastId });
    } finally {
      setSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-within:border-brand-500 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAttachmentClick}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title="Attach file"
          disabled={sending || disabled}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          disabled={disabled || sending}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
            'outline-none max-h-32 overflow-y-auto leading-relaxed py-1'
          )}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!body.trim() || sending || disabled}
          className={cn(
            'p-2 rounded-xl transition-all shrink-0',
            body.trim() && !sending && !disabled
              ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-500/30'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 px-1">
        Enter to send · Shift+Enter for new line · Max 10MB attachment
      </p>
    </div>
  );
}
