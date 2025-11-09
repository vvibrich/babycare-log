'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function PWARouter() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isPWA, setIsPWA] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const navigatorStandalone = (window.navigator as any).standalone === true;
      return standalone || navigatorStandalone;
    };

    setIsPWA(checkPWA());
  }, []);

  useEffect(() => {
    if (isPWA === null || loading) return;

    // If running as PWA, redirect based on auth status
    if (isPWA) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } else {
      // If not PWA, redirect to landing page
      router.push('/landing');
    }
  }, [isPWA, user, loading, router]);

  // Show loading while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    </div>
  );
}
