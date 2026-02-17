// Sentry configuration for Edge runtime (middleware)
// This file is loaded automatically by Next.js

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Minimal sampling for edge (performance sensitive)
  tracesSampleRate: 0.05,

  // Capture all errors
  sampleRate: 1.0,

  // PII safety
  sendDefaultPii: false,
});
