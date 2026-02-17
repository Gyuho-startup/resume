'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">
            UK Resume Builder
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-slate-600 truncate max-w-[160px]">
                  {user.email}
                </span>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
