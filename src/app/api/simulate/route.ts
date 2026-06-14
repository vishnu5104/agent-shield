import { NextResponse } from 'next/server';
import { shield } from '@/lib/shield';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, merchant } = body;

    if (amount === undefined || merchant === undefined) {
      return NextResponse.json(
        { error: 'Missing amount or merchant' },
        { status: 400 }
      );
    }

    const txAmount = Number(amount);
    const decision = await shield.check({
      amount: txAmount,
      merchant: String(merchant),
    });

    return NextResponse.json({
      success: decision.approved,
      decision,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
