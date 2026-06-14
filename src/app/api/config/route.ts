import { NextResponse } from 'next/server';
import { shield } from '@/lib/shield';

export async function GET() {
  return NextResponse.json(shield.config);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dailyLimit, whitelist, minReputation, rateLimit } = body;

    shield.updateConfig({
      dailyLimit: Number(dailyLimit),
      whitelist: Array.isArray(whitelist) ? whitelist : [],
      minReputation: Number(minReputation),
      rateLimit: rateLimit
        ? {
            maxRequests: Number(rateLimit.maxRequests),
            windowMs: Number(rateLimit.windowMs),
          }
        : undefined,
    });

    return NextResponse.json({ success: true, config: shield.config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
