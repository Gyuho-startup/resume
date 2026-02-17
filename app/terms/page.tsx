import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Terms of Service | CV Builder',
  description: 'Terms of Service for CV Builder — the free UK CV and resume builder.',
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">Terms of Service</span>
        </nav>

        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Effective date: February 2026</p>

        <p className="text-slate-700 leading-relaxed mb-6">
          Please read these Terms of Service carefully before using CV Builder. By accessing or using
          our service, you agree to be bound by these terms. If you do not agree, you must not use
          the service.
        </p>

        {/* 1. Description of Service */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">1. Description of Service</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          CV Builder provides an online CV and resume creation tool designed for UK job seekers,
          including students and graduates. The service includes:
        </p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-1">
          <li>A step-by-step CV builder with ATS-friendly templates</li>
          <li>Free PDF export with a CV Builder watermark</li>
          <li>An optional paid Export Pass that removes the watermark and enables unlimited high-quality PDF exports for 24 hours</li>
          <li>Optional account creation to save and manage CVs across sessions</li>
        </ul>

        {/* 2. Free vs Paid Tiers */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">2. Free and Paid Tiers</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>Free tier:</strong> All users, including guests who have not created an account,
          may build a CV and export it as a watermarked PDF at no cost. No registration is required.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>Export Pass (paid):</strong> For a one-off payment of £2.99, users may purchase
          a 24-hour Export Pass. During the pass window, the watermark is removed and unlimited
          PDF exports are available. The pass is time-limited and non-transferable. See Section 5
          for payment terms.
        </p>

        {/* 3. Guest Usage */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">3. Guest Usage</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          When you use CV Builder without creating an account, your CV data is stored only in
          your browser's LocalStorage. We do not transmit or store your CV content on our servers
          in guest mode. Your data will be lost if you clear your browser storage or switch devices.
          We accept no liability for data loss resulting from browser-side storage limitations.
        </p>

        {/* 4. Registered Users */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">4. Registered Users</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Creating an account allows your CV data to be stored securely on our servers via
          Supabase. You are responsible for maintaining the confidentiality of your account
          credentials and for all activity that occurs under your account. You must provide
          accurate information when registering.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          You may delete your account and all associated data at any time from your account
          settings. Upon deletion, your CV content, export history, and personal information
          will be permanently removed, except where retention is required for legal or
          accounting purposes (see our Privacy Policy).
        </p>

        {/* 5. Payment Terms */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">5. Payment Terms</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Payments are processed securely by Stripe. We do not store your card details.
          The Export Pass costs £2.99 and grants 24-hour access from the time of purchase.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>Refund policy:</strong> Due to the immediate digital nature of the Export Pass,
          we do not offer refunds once a pass has been successfully used to generate a
          watermark-free export. If you experience a technical failure that prevents you from
          using the pass, please contact us at{' '}
          <a href="mailto:support@cvbuilder.co.uk" className="text-blue-600 hover:underline">
            support@cvbuilder.co.uk
          </a>{' '}
          and we will review your case and may issue a refund at our discretion.
        </p>

        {/* 6. Acceptable Use */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">6. Acceptable Use</h2>
        <p className="text-slate-700 leading-relaxed mb-4">You agree not to:</p>
        <ul className="list-disc list-inside text-slate-700 leading-relaxed mb-4 space-y-1">
          <li>Use the service for any unlawful purpose or in violation of any applicable UK or international law</li>
          <li>Submit false, misleading, or fraudulent information in your CV or account</li>
          <li>Attempt to reverse-engineer, copy, or commercially redistribute our CV templates or software</li>
          <li>Use automated tools (bots, scrapers) to access or abuse the service</li>
          <li>Attempt to circumvent the watermark or payment gating by technical means</li>
          <li>Transmit any content that is defamatory, offensive, or infringes third-party rights</li>
        </ul>

        {/* 7. Intellectual Property */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">7. Intellectual Property</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          You retain full ownership of the content you enter into your CV. By using the service,
          you grant CV Builder a limited, non-exclusive licence to process your CV content solely
          for the purpose of rendering and delivering your PDF export.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          The CV Builder application, templates, branding, and all associated software are owned
          by CV Builder and protected by applicable intellectual property laws. You may not
          reproduce, redistribute, or create derivative works from our templates for commercial
          purposes without our prior written consent.
        </p>

        {/* 8. Disclaimers */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">8. Disclaimers</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>No ATS guarantee:</strong> Our templates follow ATS-friendly best practices,
          including single-column layouts, standard fonts, and clear section headings. However,
          we cannot guarantee acceptance by any specific Applicant Tracking System, as each
          system has unique and changing requirements. We recommend tailoring your CV to each
          job application.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          <strong>No job outcome guarantee:</strong> This service helps you create a professional
          CV. It does not guarantee job interviews, employment offers, or any specific outcome
          from your job applications.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          The service is provided "as is" without warranties of any kind, express or implied,
          including but not limited to warranties of merchantability, fitness for a particular
          purpose, or non-infringement.
        </p>

        {/* 9. Limitation of Liability */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">9. Limitation of Liability</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          To the fullest extent permitted by applicable law, CV Builder shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages, including but
          not limited to loss of employment opportunity, loss of income, or data loss arising
          from your use of the service.
        </p>
        <p className="text-slate-700 leading-relaxed mb-4">
          Our total aggregate liability to you for any claim arising from these terms or your
          use of the service shall not exceed the amount you paid for the Export Pass in the
          12 months preceding the claim (or £2.99 if no purchase was made).
        </p>

        {/* 10. Privacy */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">10. Privacy</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Your use of the service is also governed by our{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>,
          which is incorporated into these Terms by reference.
        </p>

        {/* 11. Termination */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">11. Termination</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We reserve the right to suspend or terminate your access to the service at any time,
          without prior notice, if you breach these Terms. You may delete your account and cease
          using the service at any time. Provisions that by their nature should survive termination
          (including intellectual property, disclaimers, and limitation of liability) will do so.
        </p>

        {/* 12. Changes to Terms */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">12. Changes to These Terms</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          We may update these Terms from time to time. We will notify registered users of material
          changes via email or an in-app notice. Continued use of the service after the effective
          date of any changes constitutes your acceptance of the revised Terms.
        </p>

        {/* 13. Governing Law */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">13. Governing Law</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          These Terms are governed by and construed in accordance with the laws of England and
          Wales. Any disputes arising from or in connection with these Terms shall be subject to
          the exclusive jurisdiction of the courts of England and Wales.
        </p>

        {/* 14. Contact */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-8">14. Contact</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          For questions about these Terms, please contact us at:{' '}
          <a href="mailto:support@cvbuilder.co.uk" className="text-blue-600 hover:underline">
            support@cvbuilder.co.uk
          </a>
        </p>

        <hr className="border-slate-200 mt-12 mb-6" />
        <p className="text-sm text-slate-400">Last updated: February 2026</p>
      </main>
    </div>
  );
}
