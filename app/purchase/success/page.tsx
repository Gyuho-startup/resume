import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe/config';
import { getActivePass } from '@/lib/stripe/pass-utils';
import StorePassClient from '@/components/purchase/StorePassClient';
import Header from '@/components/layout/Header';
import Link from 'next/link';

interface SearchParams {
  session_id?: string;
}

async function SuccessContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect('/builder');
  }

  // Verify session server-side
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    redirect('/builder');
  }

  if (session.payment_status !== 'paid') {
    redirect('/builder');
  }

  // Get email from session
  const email = session.customer_email || session.metadata?.email;
  const userId = session.metadata?.userId;

  if (!email) {
    redirect('/builder');
  }

  // Try to get active pass from database
  let activePass = await getActivePass(
    userId ? { userId } : { email }
  );

  // If webhook hasn't been processed yet, create temporary pass info from session
  let passEndAt: string;
  if (!activePass) {
    // Webhook hasn't processed yet - use session data
    // Pass duration: 24 hours from now
    const now = new Date();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    passEndAt = endDate.toISOString();

    console.log('Webhook not processed yet, using session data for display');
  } else {
    passEndAt = activePass.passEndAt;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />

      {/* Store pass in localStorage for guest users */}
      <StorePassClient expiresAt={passEndAt} />

      <div className="flex items-center justify-center p-6 mt-8">

      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Purchase Successful! 🎉
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Your 24-Hour Export Pass is now active
          </p>

          {/* Pass Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Status:</span>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Expires:</span>
                <span className="text-sm text-slate-900 font-medium">
                  {new Date(passEndAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Email:</span>
                <span className="text-sm text-slate-900">{email}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              What's included:
            </h2>
            <ul className="text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-slate-600">
                  Unlimited PDF exports for 24 hours
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-slate-600">
                  No watermark on exported CVs
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-slate-600">
                  High-quality PDF with perfect formatting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-slate-600">
                  Edit and re-export as many times as you need
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/builder"
              className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Go to Builder →
            </Link>

            <p className="text-sm text-slate-500">
              Receipt sent to <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>

        {/* Guest Notice */}
        {!userId && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-700">
              💡 <strong>Tip:</strong> Create a free account to save your CVs and
              view export history
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-slate-600">Verifying purchase...</div>
        </div>
      }
    >
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
