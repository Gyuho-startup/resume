import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Cookie Policy | CV Builder',
  description: 'Cookie Policy for CV Builder — what cookies and browser storage we use.',
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Cookie Policy</span>
        </nav>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Cookie Policy</h1>
        <p className="text-slate-500 mb-8">Effective date: February 2026</p>

        <p className="text-slate-700 leading-relaxed mb-6">
          This Cookie Policy explains how CV Builder uses cookies and similar browser storage
          technologies. We have designed this service to use as few cookies as possible — only
          those that are strictly necessary to make the site work.
        </p>

        {/* 1. What Are Cookies */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">1. What Are Cookies?</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Cookies are small text files placed on your device by a website when you visit it.
          They are widely used to make websites work, or work more efficiently, and to provide
          information to the site owner.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          This policy also covers LocalStorage, which is a separate browser storage mechanism
          that works similarly to cookies but is not transmitted with HTTP requests.
        </p>

        {/* 2. Essential Cookies */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">2. Essential Cookies</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We use one category of cookie: essential authentication cookies set by Supabase, our
          authentication and database provider.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Cookie</th>
                <th className="text-left px-4 py-3 font-semibold">Purpose</th>
                <th className="text-left px-4 py-3 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-access-token</td>
                <td className="px-4 py-3">Maintains your login session (set only if you sign in)</td>
                <td className="px-4 py-3">Session / 1 hour</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">sb-refresh-token</td>
                <td className="px-4 py-3">Allows your session to be renewed without re-logging in</td>
                <td className="px-4 py-3">Up to 60 days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-700 leading-relaxed mb-4">
          These cookies are set only when you sign in to your account. If you use CV Builder
          as a guest (without signing in), no cookies are set at all.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          Essential cookies cannot be disabled without breaking the login functionality of
          the service. Under the UK Privacy and Electronic Communications Regulations (PECR),
          strictly necessary cookies do not require consent.
        </p>

        {/* 3. Analytics */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">3. Analytics</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We use <strong>Plausible Analytics</strong> to understand how visitors use our service.
          Plausible is a privacy-friendly analytics tool that:
        </p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-1">
          <li>Does not use cookies of any kind</li>
          <li>Does not collect or store personal data</li>
          <li>Does not track individuals across sessions or devices</li>
          <li>Records only anonymous, aggregate statistics (e.g. page views and country-level traffic)</li>
          <li>Is fully compliant with UK GDPR and PECR</li>
        </ul>
        <p className="text-slate-700 leading-relaxed mb-4">
          Because Plausible does not use cookies or collect personal data, no consent banner
          is required for our analytics.
        </p>

        {/* 4. No Advertising Cookies */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">4. No Advertising or Tracking Cookies</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We do not use any advertising, retargeting, or third-party tracking cookies. We have
          no relationship with advertising networks. Your browsing behaviour on CV Builder is
          not shared with advertisers.
        </p>

        {/* 5. LocalStorage */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">5. LocalStorage (Browser Storage)</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          If you use CV Builder as a guest (without creating an account), your CV draft is
          saved to your browser's <strong>LocalStorage</strong>. This is a browser feature,
          not a cookie. LocalStorage data:
        </p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-1">
          <li>Is stored only on your own device</li>
          <li>Is never transmitted to our servers as part of requests</li>
          <li>Persists until you clear it or clear your browser's site data</li>
          <li>Contains only your CV content — no tracking identifiers</li>
        </ul>
        <p className="text-slate-700 leading-relaxed mb-4">
          You can clear LocalStorage at any time via your browser's developer tools or by
          clearing your browser's site data for cvbuilder.co.uk. Doing so will permanently
          delete any unsaved guest CV drafts from your device.
        </p>

        {/* 6. Third-Party Cookies */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">6. Third-Party Cookies</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          When you purchase an Export Pass, you are redirected to a Stripe-hosted checkout page.
          Stripe may set its own cookies on that page for fraud prevention and security purposes.
          Please refer to{' '}
          <a
            href="https://stripe.com/gb/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Stripe's Privacy Policy
          </a>{' '}
          for details.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          Other than the Stripe checkout flow, we do not load third-party scripts that set
          cookies on our pages.
        </p>

        {/* 7. Managing Cookies */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">7. Managing and Deleting Cookies</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          You can control and delete cookies through your browser settings. Here are links to
          cookie management guides for common browsers:
        </p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-1">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Apple Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p className="text-slate-700 leading-relaxed mb-4">
          Please note that disabling essential authentication cookies will prevent you from
          signing in to your account. Guest use (without login) will continue to work normally
          without any cookies.
        </p>

        {/* 8. No Consent Banner */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">8. Why We Do Not Show a Cookie Banner</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Under UK PECR, a cookie consent banner is only required for non-essential cookies
          (such as analytics cookies or advertising cookies). Because our analytics tool
          (Plausible) uses no cookies and our only cookies are strictly necessary session
          cookies, we are not required to display a consent banner. We have intentionally
          designed our service this way to respect your privacy.
        </p>

        {/* 9. Changes */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">9. Changes to This Policy</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We may update this Cookie Policy if we change the technologies we use. Any material
          changes will be reflected on this page with an updated effective date. We will
          notify registered users of significant changes via email or an in-app notice.
        </p>

        {/* 10. Contact */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">10. Contact</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          If you have any questions about our use of cookies or browser storage, please
          contact us at:{' '}
          <a href="mailto:privacy@cvbuilder.co.uk" className="text-blue-600 hover:underline">
            privacy@cvbuilder.co.uk
          </a>
        </p>

        <hr className="border-slate-200 mt-12 mb-6" />
        <p className="text-sm text-slate-400">Last updated: February 2026</p>
      </main>
    </div>
  );
}
