'use client';

import React, { useState, useRef } from 'react';
import { FileText, CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ResumeVersion {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  ats_score?: number;
  is_active: boolean;
  created_at: string;
}

interface ResumeUploadProps {
  versions: ResumeVersion[];
  onUploadSuccess: () => void;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ResumeUpload({ versions, onUploadSuccess, onSetActive, onDelete }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const toastId = toast.loading('Parsing your resume with AI...');
    try {
      const fd = new FormData();
      fd.append('resume', file);

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: fd,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse resume.');
      }

      toast.success('Resume parsed and profile updated!', { id: toastId });
      onUploadSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Parsing failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)}KB` : `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Uploading resume...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drop your resume here or <span className="text-brand-600 dark:text-brand-400">browse</span>
            </p>
            <p className="text-xs text-slate-400">PDF, DOC, DOCX — max 5MB</p>
          </div>
        )}
      </div>

      {versions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume Version History</h4>
          {versions.map((v) => (
            <div
              key={v.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                v.is_active
                  ? 'border-brand-500/40 bg-brand-50/50 dark:bg-brand-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 shrink-0 ${v.is_active ? 'text-brand-500' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{v.file_name}</p>
                  <p className="text-[10px] text-slate-400">
                    {formatSize(v.file_size)} · {formatDate(v.created_at)}
                    {v.ats_score != null && (
                      <span className="ml-2 text-emerald-500 font-bold">ATS: {v.ats_score}%</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {v.is_active ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSetActive(v.id)}
                    className="text-[10px] font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg"
                  >
                    Set Active
                  </button>
                )}
                <a
                  href={v.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-semibold text-slate-500 hover:text-brand-600 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg"
                >
                  Preview
                </a>
                <button onClick={() => onDelete(v.id)} className="p-1 text-slate-400 hover:text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
