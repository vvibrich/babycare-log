'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { WifiOff, Wifi, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Button } from './ui/button';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, syncPendingOperations } = useOfflineSync();

  if (isOnline && pendingCount === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className={`
        rounded-lg shadow-lg border p-3 backdrop-blur-sm
        ${isOnline 
          ? 'bg-blue-50/95 dark:bg-blue-950/95 border-blue-200 dark:border-blue-800' 
          : 'bg-orange-50/95 dark:bg-orange-950/95 border-orange-200 dark:border-orange-800'
        }
      `}>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`
            p-2 rounded-full
            ${isOnline 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-orange-100 dark:bg-orange-900'
            }
          `}>
            {isOnline ? (
              isSyncing ? (
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )
            ) : (
              <CloudOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            )}
          </div>

          {/* Status text */}
          <div className="flex-1 min-w-0">
            {isOnline ? (
              <>
                {isSyncing ? (
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Sincronizando...
                  </p>
                ) : pendingCount > 0 ? (
                  <>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {pendingCount} {pendingCount === 1 ? 'operação pendente' : 'operações pendentes'}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Toque para sincronizar agora
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100 flex items-center gap-1">
                  <WifiOff className="h-4 w-4" />
                  Modo Offline
                </p>
                {pendingCount > 0 && (
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {pendingCount} {pendingCount === 1 ? 'alteração salva' : 'alterações salvas'}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Sync button */}
          {isOnline && pendingCount > 0 && !isSyncing && (
            <Button 
              size="sm"
              onClick={syncPendingOperations}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
