'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { startConversation } from '@/lib/actions/shared';
import { toast } from 'sonner';

export function MessageCandidateButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const convId = await startConversation(candidateId);
      router.push(`/dashboard/messages/${convId}`);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors disabled:opacity-50"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      {loading ? 'Opening...' : `Message ${candidateName.split(' ')[0]}`}
    </button>
  );
}
