'use client';

import { useState, useEffect } from 'react';
import { exportResumeToPDF, downloadBlob } from '@/lib/api/export';
import { getPassStatusFromStorage } from '@/lib/stripe/pass-utils';
import PaywallModal from './PaywallModal';
import type { Resume } from '@/types/resume';

interface ExportButtonProps {
  resume: Resume;
  userEmail?: string;
  userId?: string;
}

export default function ExportButton({ resume, userEmail, userId }: ExportButtonProps) {
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

    try {
      const pdfBlob = await exportResumeToPDF(
        resume.templateSlug,
        resume.data,
        watermark
      );

      // Download PDF
      const watermarkSuffix = watermark ? '-watermarked' : '';
      const filename = `${resume.title.replace(/\s+/g, '-').toLowerCase()}${watermarkSuffix}-cv.pdf`;
      downloadBlob(pdfBlob, filename);
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
      <div className="flex gap-3">
        {/* Free Export */}
        <button
          onClick={handleFreeExport}
          disabled={isExporting}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
            isExporting
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-slate-500 text-white hover:bg-slate-600'
          }`}
        >
          {isExporting ? 'Exporting...' : 'Free Export'}
        </button>

        {/* Paid Export / Upgrade */}
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
          {isExporting
            ? 'Exporting...'
            : hasActivePass
            ? 'Export Premium'
            : 'Upgrade to Remove Watermark'}
        </button>
      </div>

      {/* Help Text */}
      {!hasActivePass && (
        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <strong>Free:</strong> Includes watermark
          </p>
          <p>
            <strong>Premium:</strong> No watermark, unlimited exports for 24h
            (£2.99)
          </p>
        </div>
      )}

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
