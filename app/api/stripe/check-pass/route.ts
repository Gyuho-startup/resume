import { NextRequest, NextResponse } from 'next/server';
import { hasActivePass, getActivePass } from '@/lib/stripe/pass-utils';

// Check if user has an active Export Pass
// Works for both guest (email) and logged-in users (userId)

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'Email or userId required' },
        { status: 400 }
      );
    }

    // Check for active pass
    const identifier = userId ? { userId } : { email };
    const active = await hasActivePass(identifier);

    if (!active) {
      return NextResponse.json({
        hasPass: false,
        expiresAt: null,
      });
    }

    // Get pass details
    const pass = await getActivePass(identifier);

    return NextResponse.json({
      hasPass: true,
      expiresAt: pass?.passEndAt || null,
    });
  } catch (error) {
    console.error('Check pass error:', error);
    return NextResponse.json(
      { error: 'Failed to check pass status' },
      { status: 500 }
    );
  }
}
