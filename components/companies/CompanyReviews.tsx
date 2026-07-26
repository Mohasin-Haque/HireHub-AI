'use client';

import { useState, useTransition } from 'react';
import { addCompanyReview } from '@/lib/actions/company';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

export function CompanyReviews({ companyId, reviews }: { companyId: string, reviews: any[] }) {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (rating === 0 || !title || !body) {
      toast.error('Please provide a rating, title, and review body.');
      return;
    }
    startTransition(async () => {
      try {
        await addCompanyReview(companyId, { rating, title, body });
        toast.success('Review submitted!');
        setShowForm(false);
        setRating(0);
        setTitle('');
        setBody('');
        // Note: The page needs to be revalidated or re-fetched to show the new review.
        // This is handled by revalidatePath in the server action.
      } catch (err) {
        toast.error('Failed to submit review.');
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Reviews ({reviews.length})</h2>
        {isAuthenticated && (
          <Button onClick={() => setShowForm(!showForm)} variant="outline">
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl glass-panel mb-6 space-y-4">
          <h3 className="font-bold">Your Review</h3>
          <div>
            <label className="text-xs font-semibold">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5 cursor-pointer',
                    (hoverRating || rating) >= i ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                  )}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                />
              ))}
            </div>
          </div>
          <Input label="Review Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Share your experience working at this company..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button onClick={handleSubmit} isLoading={isPending}>Submit Review</Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center py-8 text-slate-500">Be the first to review this company.</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <Image
                  src={review.profiles.avatar_url || ''}
                  alt={review.profiles.full_name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{review.profiles.full_name}</p>
                      <p className="text-xs text-slate-500">{review.profiles.headline}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn('w-4 h-4', i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300')} />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-bold mt-2">{review.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{review.body}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(review.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
