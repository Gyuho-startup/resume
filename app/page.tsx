import Link from 'next/link';
import { TEMPLATES } from '@/lib/templates';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Build Your Perfect CV for Free
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Create professional, ATS-friendly CVs in minutes. Perfect for UK entry-level job seekers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/builder"
              className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg hover:shadow-xl"
            >
              Start Building →
            </Link>
            <Link
              href="/preview"
              className="px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-lg hover:bg-slate-50 transition border-2 border-slate-200"
            >
              View Templates
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Login Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>ATS-Friendly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Why Choose Our CV Builder?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Easy to Use
            </h3>
            <p className="text-slate-600">
              Step-by-step guidance helps you create a professional CV in under 10 minutes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              ATS-Friendly
            </h3>
            <p className="text-slate-600">
              Our templates are designed to pass Applicant Tracking Systems with ease.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Instant Download
            </h3>
            <p className="text-slate-600">
              Export your CV to PDF instantly. No waiting, no sign-up required.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
          Choose from 5 Professional Templates
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          All templates are ATS-friendly and optimized for UK entry-level positions.
        </p>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TEMPLATES.map((template) => (
            <div
              key={template.slug}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 border border-slate-200"
            >
              <div className="aspect-[210/297] bg-slate-100 rounded mb-3 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {template.name}
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                {template.description.split('.')[0]}.
              </p>
              {template.isAtsSafe && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  ATS-Friendly
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/preview"
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            Preview all templates →
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-blue-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your CV?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of UK job seekers who landed interviews with our CVs.
          </p>
          <Link
            href="/builder"
            className="inline-block px-8 py-4 bg-white text-blue-500 text-lg font-semibold rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            Start Building for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© 2026 UK Resume Builder. Built with Next.js, Supabase, and Cloudflare.</p>
          <p className="mt-2">Phase 1 Complete • Phase 2 In Progress</p>
        </div>
      </footer>
    </div>
  );
}
