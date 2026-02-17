/**
 * Sentry utilities for structured error reporting
 * - Enforces PII safety (no resume content logged)
 * - Provides typed error contexts for each feature area
 */

import * as Sentry from '@sentry/nextjs';

// ─── Error Types ─────────────────────────────────────────────────────────────

export type SentryFeature =
  | 'export'
  | 'stripe'
  | 'coach'
  | 'auth'
  | 'template'
  | 'supabase';

// ─── Capture Helpers ──────────────────────────────────────────────────────────

/**
 * Capture a non-fatal error with structured context
 * Use this for expected errors (validation, 4xx responses, etc.)
 */
export function captureError(
  error: unknown,
  feature: SentryFeature,
  context?: Record<string, string | number | boolean>
) {
  Sentry.withScope(scope => {
    scope.setTag('feature', feature);
    if (context) {
      // Only allow safe, non-PII context values
      scope.setContext(feature, context);
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture an export failure with safe metadata
 * Never logs resume content - only technical details
 */
export function captureExportError(
  error: unknown,
  meta: {
    templateId?: string;
    watermark?: boolean;
    isGuest?: boolean;
    durationMs?: number;
  }
) {
  captureError(error, 'export', {
    templateId: meta.templateId ?? 'unknown',
    watermark: meta.watermark ?? false,
    isGuest: meta.isGuest ?? true,
    durationMs: meta.durationMs ?? 0,
  });
}

/**
 * Capture a Stripe / payment error with safe metadata
 * Never logs card details - only session/status info
 */
export function captureStripeError(
  error: unknown,
  meta: {
    checkoutSessionId?: string;
    status?: string;
    isGuest?: boolean;
  }
) {
  captureError(error, 'stripe', {
    // Truncate session ID (safe - not sensitive)
    checkoutSessionId: meta.checkoutSessionId
      ? meta.checkoutSessionId.substring(0, 20) + '...'
      : 'unknown',
    status: meta.status ?? 'unknown',
    isGuest: meta.isGuest ?? true,
  });
}

/**
 * Capture a Coach / AI error with safe metadata
 * Never logs conversation content - only session/stage info
 */
export function captureCoachError(
  error: unknown,
  meta: {
    sessionId?: string;
    stage?: string;
    turnCount?: number;
  }
) {
  captureError(error, 'coach', {
    sessionId: meta.sessionId
      ? meta.sessionId.substring(0, 8) + '...'
      : 'unknown',
    stage: meta.stage ?? 'unknown',
    turnCount: meta.turnCount ?? 0,
  });
}

/**
 * Capture a PDF renderer (Cloudflare Worker) error
 */
export function captureRendererError(
  error: unknown,
  meta: {
    templateId?: string;
    watermark?: boolean;
    workerStatus?: number;
    durationMs?: number;
  }
) {
  captureError(error, 'export', {
    renderer: 'cloudflare-worker',
    templateId: meta.templateId ?? 'unknown',
    watermark: meta.watermark ?? false,
    workerStatus: meta.workerStatus ?? 0,
    durationMs: meta.durationMs ?? 0,
  });
}

// ─── Performance Tracking ─────────────────────────────────────────────────────

/**
 * Track export duration for success rate monitoring
 * Emits a Sentry measurement (visible in performance dashboard)
 */
export function trackExportDuration(durationMs: number, success: boolean) {
  Sentry.metrics.distribution('export.duration_ms', durationMs, {
    attributes: { success: String(success) },
    unit: 'millisecond',
  });
}

/**
 * Increment export success/failure counter
 */
export function trackExportResult(success: boolean, isGuest: boolean) {
  Sentry.metrics.count('export.count', 1, {
    attributes: {
      success: String(success),
      is_guest: String(isGuest),
    },
  });
}

/**
 * Track Stripe checkout conversion
 */
export function trackCheckoutResult(success: boolean) {
  Sentry.metrics.count('stripe.checkout', 1, {
    attributes: { success: String(success) },
  });
}
