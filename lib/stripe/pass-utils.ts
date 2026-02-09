import { createRouteClient } from '@/lib/supabase/route-client';

// Export Pass utilities for UK Resume Builder

export interface ExportPass {
  id: string;
  userId?: string;
  email: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string;
  status: 'paid' | 'failed' | 'refunded';
  passStartAt: string;
  passEndAt: string;
  createdAt: string;
}

/**
 * Check if user has an active Export Pass
 * Works for both guest (by email) and logged-in users (by userId)
 */
export async function hasActivePass(
  identifier: { email: string } | { userId: string }
): Promise<boolean> {
  try {
    const supabase = createRouteClient();
    const now = new Date().toISOString();

    const baseQuery = supabase
      .from('purchases')
      .select('pass_start_at, pass_end_at, status')
      .eq('status', 'paid')
      .gte('pass_end_at', now)
      .lte('pass_start_at', now);

    const { data, error } = await ('email' in identifier
      ? baseQuery.eq('email', identifier.email).single()
      : baseQuery.eq('user_id', identifier.userId).single());

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking active pass:', error);
    return false;
  }
}

/**
 * Get active pass details
 */
export async function getActivePass(
  identifier: { email: string } | { userId: string }
): Promise<ExportPass | null> {
  try {
    const supabase = createRouteClient();
    const now = new Date().toISOString();

    const baseQuery = supabase
      .from('purchases')
      .select('*')
      .eq('status', 'paid')
      .gte('pass_end_at', now)
      .lte('pass_start_at', now);

    const result: any = await ('email' in identifier
      ? baseQuery.eq('email', identifier.email).single()
      : baseQuery.eq('user_id', identifier.userId).single());

    if (result.error || !result.data) {
      return null;
    }

    const data = result.data;

    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      stripeCheckoutSessionId: data.stripe_checkout_session_id,
      stripePaymentIntentId: data.stripe_payment_intent_id,
      status: data.status,
      passStartAt: data.pass_start_at,
      passEndAt: data.pass_end_at,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error getting active pass:', error);
    return null;
  }
}

/**
 * Create purchase record after successful payment
 */
export async function createPurchaseRecord({
  email,
  userId,
  sessionId,
  paymentIntentId,
}: {
  email: string;
  userId?: string;
  sessionId: string;
  paymentIntentId: string;
}): Promise<ExportPass | null> {
  try {
    const supabase = createRouteClient();
    const now = new Date();
    const passEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const result: any = await (supabase
      .from('purchases') as any)
      .insert({
        user_id: userId || null,
        email,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId,
        status: 'paid',
        pass_start_at: now.toISOString(),
        pass_end_at: passEnd.toISOString(),
      })
      .select()
      .single();

    if (result.error || !result.data) {
      console.error('Error creating purchase record:', result.error);
      return null;
    }

    const data = result.data;

    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      stripeCheckoutSessionId: data.stripe_checkout_session_id,
      stripePaymentIntentId: data.stripe_payment_intent_id,
      status: data.status,
      passStartAt: data.pass_start_at,
      passEndAt: data.pass_end_at,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error creating purchase record:', error);
    return null;
  }
}

/**
 * Check pass status from localStorage (client-side)
 * Used for guest users who purchased without logging in
 */
export function getPassStatusFromStorage(): {
  hasPass: boolean;
  expiresAt: string | null;
} {
  if (typeof window === 'undefined') {
    return { hasPass: false, expiresAt: null };
  }

  const passData = localStorage.getItem('export_pass');
  if (!passData) {
    return { hasPass: false, expiresAt: null };
  }

  try {
    const { expiresAt } = JSON.parse(passData);
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();

    if (now < expiry) {
      return { hasPass: true, expiresAt };
    } else {
      // Pass expired, remove from storage
      localStorage.removeItem('export_pass');
      return { hasPass: false, expiresAt: null };
    }
  } catch {
    return { hasPass: false, expiresAt: null };
  }
}

/**
 * Store pass info in localStorage for guest users
 */
export function storePassInLocalStorage(expiresAt: string) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    'export_pass',
    JSON.stringify({
      expiresAt,
      purchasedAt: new Date().toISOString(),
    })
  );
}
