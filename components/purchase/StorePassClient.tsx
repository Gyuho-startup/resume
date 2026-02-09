'use client';

import { useEffect } from 'react';
import { storePassInLocalStorage } from '@/lib/stripe/pass-utils';

interface StorePassClientProps {
  expiresAt: string;
}

export default function StorePassClient({ expiresAt }: StorePassClientProps) {
  useEffect(() => {
    // Store pass in localStorage for guest users
    storePassInLocalStorage(expiresAt);
  }, [expiresAt]);

  return null;
}
