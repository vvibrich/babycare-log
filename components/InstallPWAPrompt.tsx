'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, Share, MoreVertical, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function InstallPWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [browserType, setBrowserType] = useState<'ios-safari' | 'android-chrome' | 'other'>('other');

  useEffect(() => {
    // Check if user already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') return;

    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if running as PWA
    if ((window.navigator as any).standalone) return;

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Detect browser type
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      setBrowserType('ios-safari');
      // Show after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    } else if (isAndroid && isChrome) {
      setBrowserType('android-chrome');
      setTimeout(() => setShowPrompt(true), 3000);
    } else {
      // For other mobile browsers, show generic instructions
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Will show again next session (not saving to localStorage)
  };

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Smartphone className="h-6 w-6 text-blue-500" />
            Instale o BabyCare Log
          </DialogTitle>
          <DialogDescription>
            Instale o app no seu celular para acesso rápido e melhor experiência!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {browserType === 'ios-safari' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                📱 Passo a passo para iPhone/iPad:
              </p>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>
                    Toque no botão <Share className="inline h-4 w-4 mx-1" /> 
                    <strong>Compartilhar</strong> na barra inferior do Safari
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>
                    Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>
                    Toque em <strong>"Adicionar"</strong> no canto superior direito
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>
                    Pronto! O ícone do BabyCare Log aparecerá na sua tela inicial
                  </span>
                </li>
              </ol>
            </div>
          )}

          {browserType === 'android-chrome' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                📱 Passo a passo para Android:
              </p>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>
                    Toque no menu <MoreVertical className="inline h-4 w-4 mx-1" /> 
                    (três pontos) no canto superior direito
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>
                    Selecione <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>
                    Confirme tocando em <strong>"Instalar"</strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>
                    Pronto! O ícone do BabyCare Log aparecerá na sua tela inicial
                  </span>
                </li>
              </ol>
            </div>
          )}

          {browserType === 'other' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                📱 Como instalar:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Procure pela opção <strong>"Adicionar à tela inicial"</strong> ou 
                <strong> "Instalar app"</strong> no menu do seu navegador para instalar 
                o BabyCare Log como um aplicativo.
              </p>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>💡 Benefícios:</strong> Acesso mais rápido, funciona completamente offline 
              (registre dados sem internet!), notificações de lembretes e experiência completa de aplicativo!
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={handleDismiss} size="sm">
            Não mostrar novamente
          </Button>
          <Button onClick={handleRemindLater} size="sm">
            Lembrar depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
