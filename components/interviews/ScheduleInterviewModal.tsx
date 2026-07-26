'use client';

import React, { useState } from 'react';
import { scheduleInterview, updateInterview } from '@/lib/actions/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Calendar, Video, Phone, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  existingInterview?: {
    id: string;
    scheduled_at: string;
    type: string;
    meeting_link?: string;
    notes?: string;
  };
  onSuccess: () => void;
}

const INTERVIEW_TYPES = [
  { value: 'VIDEO', label: 'Video Call', icon: Video },
  { value: 'PHONE', label: 'Phone Screen', icon: Phone },
  { value: 'ONSITE', label: 'On-site', icon: MapPin },
  { value: 'TECHNICAL', label: 'Technical', icon: Users },
  { value: 'PANEL', label: 'Panel', icon: Users },
];

export function ScheduleInterviewModal({
  isOpen, onClose, applicationId, jobId, candidateId,
  candidateName, jobTitle, existingInterview, onSuccess,
}: ScheduleInterviewModalProps) {
  const isEdit = !!existingInterview;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    scheduledAt: existingInterview?.scheduled_at?.slice(0, 16) || '',
    duration: 60,
    type: existingInterview?.type || 'VIDEO',
    meetingLink: existingInterview?.meeting_link || '',
    notes: existingInterview?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduledAt) { toast.error('Please select a date and time'); return; }
    setLoading(true);
    try {
      if (isEdit && existingInterview) {
        await updateInterview(existingInterview.id, {
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          status: 'RESCHEDULED',
          meetingLink: form.meetingLink,
          notes: form.notes,
        });
        toast.success('Interview rescheduled');
      } else {
        await scheduleInterview({
          applicationId,
          jobId,
          candidateId,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          duration: form.duration,
          type: form.type,
          meetingLink: form.meetingLink,
          notes: form.notes,
        });
        toast.success('Interview scheduled & candidate notified');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Reschedule Interview' : 'Schedule Interview'}
      description={`${isEdit ? 'Update' : 'Set up'} interview with ${candidateName} for ${jobTitle}`}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Date & Time"
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INTERVIEW_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, type: value })}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  form.type === value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Duration (min)
            </label>
            <select
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {[30, 45, 60, 90, 120].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
          <Input
            label="Meeting Link"
            placeholder="https://meet.google.com/..."
            value={form.meetingLink}
            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Notes for Candidate
          </label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any preparation notes or agenda..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={loading} className="gap-2">
            <Calendar className="w-4 h-4" />
            {isEdit ? 'Reschedule' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
