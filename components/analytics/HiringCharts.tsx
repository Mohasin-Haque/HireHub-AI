'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

interface WeeklyTrendProps {
  data: { date: string; applications: number; views: number }[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendProps) {
  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2} dot={false} name="Applications" />
        <Line type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} dot={false} name="Views" />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface HiringFunnelProps {
  funnel: {
    total: number;
    reviewing: number;
    interviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
}

export function HiringFunnelChart({ funnel }: HiringFunnelProps) {
  const data = [
    { name: 'Applied', value: funnel.total, fill: '#6366f1' },
    { name: 'Reviewing', value: funnel.reviewing, fill: '#8b5cf6' },
    { name: 'Interviewing', value: funnel.interviewing, fill: '#06b6d4' },
    { name: 'Shortlisted', value: funnel.shortlisted, fill: '#f59e0b' },
    { name: 'Accepted', value: funnel.accepted, fill: '#10b981' },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((entry, i) => (
            <rect key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ApplicationsBarProps {
  data: { date: string; applications: number }[];
}

export function ApplicationsBarChart({ data }: ApplicationsBarProps) {
  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }}
        />
        <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
      </BarChart>
    </ResponsiveContainer>
  );
}
