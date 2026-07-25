'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (_data: ResetPasswordInput) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setIsSent(true);
    toast.success('Password reset email sent!');
  };

  return (
    <div className="p-8 rounded-3xl glass-panel shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-500">Enter your email to receive a password reset link</p>
      </div>

      {isSent ? (
        <div className="text-center py-4 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Check Your Inbox!</p>
          <p className="text-xs text-slate-500">
            We have sent password recovery instructions to your email address.
          </p>
          <Link href="/login" className="inline-block mt-4 text-xs font-bold text-brand-600 hover:underline">
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Account Email"
            type="email"
            placeholder="alex@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Button type="submit" isLoading={isLoading} variant="primary" className="w-full">
            Send Reset Link
          </Button>
        </form>
      )}

      <div className="pt-2 text-center">
        <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
