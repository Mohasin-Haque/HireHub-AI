import { NextRequest, NextResponse } from 'next/server';
import { HireHubStore } from '@/lib/db/store';

export async function GET() {
  const bookmarks = HireHubStore.getBookmarks();
  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const isBookmarked = HireHubStore.toggleBookmark(jobId);
    return NextResponse.json({ jobId, isBookmarked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
