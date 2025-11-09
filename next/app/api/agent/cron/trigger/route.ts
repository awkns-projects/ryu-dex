import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// This endpoint lets an authenticated user request a cron check for all agents or a specific agentId.
// It proxies to the internal cron route with the CRON secret so we don't expose the token client-side.

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await request.json().catch(() => ({ agentId: undefined }));

    const cronToken = process.env.CRON_SECRET_TOKEN || 'cron-secret-token';
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || '';
    const baseUrl = base
      ? (base.startsWith('http') ? base : `https://${base}`)
      : 'http://localhost:3000';

    const targetUrl = `${baseUrl}/api/agent/cron`;
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${cronToken}`,
      },
      body: JSON.stringify(agentId ? { agentId } : {}),
    });

    const data = await res.json().catch(() => ({ ok: res.ok }));
    return NextResponse.json({ ok: res.ok, status: res.status, data }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


