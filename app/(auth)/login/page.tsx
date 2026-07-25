'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { useAuth, UserRole } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, UserCheck, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CANDIDATE');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex.morgan@example.com',
      password: 'password123',
      role: 'CANDIDATE',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      await login(data.email, selectedRole);
      toast.success(`Logged in successfully as ${selectedRole}`);
      if (selectedRole === 'EMPLOYER') {
        router.push('/dashboard/employer');
      } else {
        router.push('/jobs');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
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
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500">Sign in to your HireHub AI account</p>
      </div>

      {/* Role Selection Tabs */}
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
          Candidate
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
          label="Email Address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between text-xs font-semibold">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <input type="checkbox" defaultChecked className="rounded text-brand-600 focus:ring-brand-500" />
            Remember me
          </label>
          <Link href="/reset-password" className="text-brand-600 dark:text-brand-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isLoading} variant="primary" className="w-full gap-2 py-3">
          <span>Sign In as {selectedRole}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
          Sign up now
        </Link>
      </p>
    </div>
  );
}
