import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const securityHeaders = [
  // Prevents clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevents MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Reduces referrer leakage
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Forces HTTPS for 1 year, including subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Restricts browser feature access
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy
  // NOTE: If you add inline scripts/styles later you must add a nonce or hash.
  // 'unsafe-inline' for style-src is required for Tailwind's style injection.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://o*.ingest.sentry.io",
      "frame-src https://js.stripe.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set in CI/CD or .env)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (CI/CD only)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Suppresses Sentry CLI output during build
  silent: !process.env.CI,

  // Upload source maps only in production builds
  sourcemaps: {
    // Delete source maps after upload (don't expose in production)
    deleteSourcemapsAfterUpload: true,
  },

  // Route-based performance monitoring
  autoInstrumentServerFunctions: true,

  // Disable Sentry toolbar in development
  disableLogger: process.env.NODE_ENV !== 'production',
});
