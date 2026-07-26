'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validations';
import { useAuth, UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, UserCheck, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CANDIDATE');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'CANDIDATE',
      companyName: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const result = await signup(data.fullName, data.email, data.password, selectedRole, data.companyName);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Account created! Check your email to confirm.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl glass-panel shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-500">Join HireHub AI today</p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('CANDIDATE');
            setValue('role', 'CANDIDATE');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            selectedRole === 'CANDIDATE'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Job Candidate
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRole('EMPLOYER');
            setValue('role', 'EMPLOYER');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            selectedRole === 'EMPLOYER'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Employer
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Alex Morgan"
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        {selectedRole === 'EMPLOYER' && (
          <Input
            label="Company Name"
            placeholder="Vercel Inc."
            {...register('companyName')}
            error={errors.companyName?.message}
          />
        )}

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Button type="submit" isLoading={isLoading} variant="primary" className="w-full gap-2 py-3">
          <span>Create {selectedRole} Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-2">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
