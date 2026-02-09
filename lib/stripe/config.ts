import Stripe from 'stripe';

// Stripe configuration for UK Resume Builder
// Export Pass: One-off payment for 24h unlimited exports without watermark

// Use a placeholder key during build if not set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

// Export Pass Product Configuration
export const EXPORT_PASS_CONFIG = {
  priceId: process.env.STRIPE_PRICE_ID_EXPORT_PASS,
  currency: 'gbp',
  amount: 299, // £2.99 in pence
  duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  productName: '24-Hour Export Pass',
  description: 'Unlimited high-quality PDF exports without watermark for 24 hours',
};

// Webhook configuration
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
