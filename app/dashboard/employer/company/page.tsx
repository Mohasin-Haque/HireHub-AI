'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCompany, upsertCompany } from '@/lib/actions/employer';
import { uploadCompanyLogo } from '@/lib/actions/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Building2, Upload, Plus, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const COMPANY_SIZES = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'];

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [, startTransition] = useTransition();
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', website: '', description: '', industry: '', location: '',
    size: '1-10 employees', hiringStatus: true,
    socialLinks: { linkedin: '', twitter: '', github: '' },
  });
  const [benefits, setBenefits] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [benefitInput, setBenefitInput] = useState('');
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    startTransition(async () => {
      const c = await getCompany();
      if (c) {
        setCompany(c);
        setForm({
          name: c.name || '',
          website: c.website || '',
          description: c.description || '',
          industry: c.industry || '',
          location: c.location || '',
          size: c.size || '1-10 employees',
          hiringStatus: c.hiring_status ?? true,
          socialLinks: c.social_links || { linkedin: '', twitter: '', github: '' },
        });
        setBenefits(c.benefits || []);
        setTechStack(c.tech_stack || []);
      }
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const url = await uploadCompanyLogo(fd);
      setCompany((prev: any) => ({ ...prev, logo_url: url }));
      toast.success('Logo uploaded!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Company name is required'); return; }
    setSaving(true);
    try {
      await upsertCompany({ ...form, benefits, techStack });
      toast.success('Company profile saved!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const val = input.trim();
    if (val && !list.includes(val)) { setList([...list, val]); setInput(''); }
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.filter((i) => i !== item));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/employer" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <Button onClick={handleSave} isLoading={saving} variant="primary" className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl border-2 border-brand-500/30 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {company?.logo_url ? (
                <Image src={company.logo_url} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <button
              onClick={() => logoRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-md"
            >
              {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Company Profile</h1>
            <p className="text-xs text-slate-500">Attract top talent with a compelling company page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Website" placeholder="https://company.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Industry" placeholder="e.g. SaaS, Fintech, AI" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="Location" placeholder="San Francisco, CA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Company Size</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Hiring Status</label>
            <div className="flex items-center gap-3 h-11">
              <button
                type="button"
                onClick={() => setForm({ ...form, hiringStatus: !form.hiringStatus })}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.hiringStatus ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hiringStatus ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {form.hiringStatus ? 'Actively Hiring' : 'Not Hiring'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Company Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your company culture, mission, and what makes you unique..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Benefits & Perks</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={benefitInput}
              onChange={(e) => setBenefitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(benefits, setBenefits, benefitInput, setBenefitInput))}
              placeholder="e.g. Remote work, Health insurance..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
            />
            <button type="button" onClick={() => addItem(benefits, setBenefits, benefitInput, setBenefitInput)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b) => (
              <span key={b} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 border border-emerald-500/20">
                {b} <button type="button" onClick={() => removeItem(benefits, setBenefits, b)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Tech Stack</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(techStack, setTechStack, techInput, setTechInput))}
              placeholder="e.g. React, PostgreSQL, AWS..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
            />
            <button type="button" onClick={() => addItem(techStack, setTechStack, techInput, setTechInput)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t) => (
              <span key={t} className="px-3 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs flex items-center gap-1.5 border border-brand-500/20">
                {t} <button type="button" onClick={() => removeItem(techStack, setTechStack, t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Social Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="LinkedIn" placeholder="https://linkedin.com/company/..." value={form.socialLinks.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} />
            <Input label="Twitter / X" placeholder="https://twitter.com/..." value={form.socialLinks.twitter} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })} />
            <Input label="GitHub" placeholder="https://github.com/..." value={form.socialLinks.github} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} />
          </div>
        </div>
      </div>
    </div>
  );
}
