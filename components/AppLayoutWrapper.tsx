'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppLayout } from './AppLayout';
import { InstallPWAPrompt } from './InstallPWAPrompt';
import { OfflineIndicator } from './OfflineIndicator';

interface AppLayoutWrapperProps {
  children: ReactNode;
}

// Páginas que não devem ter o layout principal (login, signup, etc)
const publicPages = ['/login', '/signup'];

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();
  
  // Se for página pública, não aplica o layout
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }
  
  // Para páginas autenticadas, usa o layout com sidebar e bottom nav
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <InstallPWAPrompt />
      <OfflineIndicator />
    </>
  );
}
