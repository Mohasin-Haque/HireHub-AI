import { NextRequest, NextResponse } from 'next/server';
import { HireHubStore } from '@/lib/db/store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = HireHubStore.getJobById(id);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  HireHubStore.incrementViews(id);
  return NextResponse.json(job);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updated = HireHubStore.updateJob(id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = HireHubStore.deleteJob(id);

  return NextResponse.json({ success: deleted });
}
