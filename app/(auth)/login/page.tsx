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

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: 'CANDIDATE' },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Logged in successfully!');
      router.push(selectedRole === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/candidate');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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

      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
        {(['CANDIDATE', 'EMPLOYER'] as ('CANDIDATE' | 'EMPLOYER')[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setSelectedRole(r); setValue('role', r); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === r
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {r === 'CANDIDATE' ? <UserCheck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <div className="flex items-center justify-end text-xs font-semibold">
          <Link href="/reset-password" className="text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" isLoading={isLoading} variant="primary" className="w-full gap-2 py-3">
          Sign In <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 pt-2">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">Sign up now</Link>
      </p>
    </div>
  );
}
