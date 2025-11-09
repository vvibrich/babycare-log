'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom navigation for mobile */}
      <BottomNav />
    </div>
  );
}
