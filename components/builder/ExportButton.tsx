'use client';

import { useState, useEffect } from 'react';
import { exportResumeToPDF, downloadBlob } from '@/lib/api/export';
import { getPassStatusFromStorage } from '@/lib/stripe/pass-utils';
import { logExport } from '@/lib/api/resume-operations';
import { analytics } from '@/lib/analytics';
import PaywallModal from './PaywallModal';
import type { Resume } from '@/types/resume';

interface ExportButtonProps {
  resume: Resume;
  userEmail?: string;
  userId?: string;
  compact?: boolean;
}

export default function ExportButton({ resume, userEmail, userId, compact = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasActivePass, setHasActivePass] = useState(false);
  const [passExpiresAt, setPassExpiresAt] = useState<string | null>(null);

  // Check for active pass on mount and after purchase
  useEffect(() => {
    checkActivePass();

    // Listen for storage changes (e.g., after successful purchase)
    const handleStorageChange = () => {
      checkActivePass();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkActivePass = async () => {
    // For guest users: check localStorage
    const localPass = getPassStatusFromStorage();
    if (localPass.hasPass) {
      setHasActivePass(true);
      setPassExpiresAt(localPass.expiresAt);
      return;
    }

    // For logged-in users: check server
    if (userId || userEmail) {
      try {
        const response = await fetch('/api/stripe/check-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: userEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          setHasActivePass(data.hasPass);
          setPassExpiresAt(data.expiresAt);
        }
      } catch (error) {
        console.error('Failed to check pass status:', error);
      }
    }
  };

  const handleExport = async (watermark: boolean) => {
    setIsExporting(true);
    setError(null);

    analytics.exportClick(watermark);

    try {
      const exportStart = Date.now();
      const pdfBlob = await exportResumeToPDF(
        resume.templateSlug,
        resume.data,
        watermark,
        userEmail,
        resume.sectionOrder
      );
      const durationMs = Date.now() - exportStart;

      analytics.exportSuccess(watermark, durationMs);

      // Download PDF
      const watermarkSuffix = watermark ? '-watermarked' : '';
      const filename = `${resume.title.replace(/\s+/g, '-').toLowerCase()}${watermarkSuffix}-cv.pdf`;
      downloadBlob(pdfBlob, filename);

      // Log export to database if user is logged in and resume has ID
      if (userId && resume.id) {
        await logExport(
          resume.id,
          userId,
          resume.templateSlug,
          watermark
        );
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.message || 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFreeExport = () => {
    handleExport(true); // With watermark
  };

  const handlePaidExport = () => {
    if (hasActivePass) {
      handleExport(false); // No watermark
    } else {
      analytics.checkoutStart();
      setShowPaywall(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Pass Status Banner */}
      {hasActivePass && passExpiresAt && (
        <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-green-700">
                Export Pass Active
              </span>
            </div>
            <span className="text-xs text-green-600">
              Expires{' '}
              {new Date(passExpiresAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-2">
        {compact ? (
          <>
            {/* Compact: Free Export */}
            <button
              onClick={handleFreeExport}
              disabled={isExporting}
              className={`h-9 px-4 text-sm rounded-md font-semibold transition-colors duration-150 ${
                isExporting
                  ? 'border-2 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Free Export'}
              {!isExporting && (
                <span className="text-xs font-normal opacity-60 ml-1">(watermark)</span>
              )}
            </button>

            {/* Compact: Paid Export / Upgrade */}
            <button
              onClick={handlePaidExport}
              disabled={isExporting}
              className={`h-9 px-4 text-sm rounded-md font-semibold transition-colors duration-150 ${
                isExporting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : hasActivePass
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExporting
                ? 'Exporting...'
                : hasActivePass
                ? 'Export Premium'
                : 'Remove Watermark'}
              {!isExporting && !hasActivePass && (
                <span className="text-xs font-normal opacity-80 ml-1">· £2.99</span>
              )}
            </button>
          </>
        ) : (
          <>
            {/* Full: Free Export */}
            <button
              onClick={handleFreeExport}
              disabled={isExporting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                isExporting
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-slate-500 text-white hover:bg-slate-600'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>{isExporting ? 'Exporting...' : 'Free Export'}</span>
                {!isExporting && (
                  <span className="text-xs font-normal opacity-90 mt-1">
                    (includes watermark)
                  </span>
                )}
              </div>
            </button>

            {/* Full: Paid Export / Upgrade */}
            <button
              onClick={handlePaidExport}
              disabled={isExporting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                isExporting
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : hasActivePass
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>
                  {isExporting
                    ? 'Exporting...'
                    : hasActivePass
                    ? 'Export Premium'
                    : 'Upgrade to Remove Watermark'}
                </span>
                {!isExporting && !hasActivePass && (
                  <span className="text-xs font-normal opacity-90 mt-1">
                    (no watermark, unlimited 24h · £2.99)
                  </span>
                )}
              </div>
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        userEmail={userEmail}
        userId={userId}
      />
    </div>
  );
}
