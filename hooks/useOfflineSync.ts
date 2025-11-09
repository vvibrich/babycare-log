import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  getPendingOperations,
  clearPendingOperation,
  setLastSyncTime,
  saveRecordsToCache,
  saveChildrenToCache,
  saveIncidentsToCache,
} from '@/lib/offlineDb';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // If we just came back online, trigger sync
      if (online) {
        syncPendingOperations();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Check initial status
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Check pending operations count
  const updatePendingCount = useCallback(async () => {
    try {
      const operations = await getPendingOperations();
      setPendingCount(operations.length);
    } catch (error) {
      console.error('Error checking pending operations:', error);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
    
    // Check every 10 seconds
    const interval = setInterval(updatePendingCount, 10000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Sync pending operations
  const syncPendingOperations = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    try {
      const operations = await getPendingOperations();
      
      if (operations.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`🔄 Sincronizando ${operations.length} operações pendentes...`);

      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'create':
              await handleCreate(operation.table, operation.data);
              break;
            case 'update':
              await handleUpdate(operation.table, operation.data);
              break;
            case 'delete':
              await handleDelete(operation.table, operation.data.id);
              break;
          }

          // Clear successful operation
          await clearPendingOperation(operation.id!);
          console.log(`✅ Operação ${operation.type} em ${operation.table} sincronizada`);
        } catch (error) {
          console.error(`❌ Erro ao sincronizar operação ${operation.type}:`, error);
          // Don't clear operation, will retry next time
        }
      }

      // Update pending count after sync
      await updatePendingCount();
      console.log('✅ Sincronização completa!');
    } catch (error) {
      console.error('Erro durante sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingCount]);

  // Handle create operations
  const handleCreate = async (table: string, data: any) => {
    const { error } = await supabase.from(table).insert(data);
    if (error) throw error;
  };

  // Handle update operations
  const handleUpdate = async (table: string, data: any) => {
    const { id, ...updateData } = data;
    const { error } = await supabase.from(table).update(updateData).eq('id', id);
    if (error) throw error;
  };

  // Handle delete operations
  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  };

  // Sync data from server to local cache
  const syncFromServer = useCallback(async (userId: string, childId?: string) => {
    if (!navigator.onLine) return;

    try {
      console.log('📥 Sincronizando dados do servidor...');

      // Sync children
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (childrenError) throw childrenError;
      if (children) {
        await saveChildrenToCache(children);
        await setLastSyncTime('children', Date.now());
      }

      // Sync records if childId is provided
      if (childId) {
        const { data: records, error: recordsError } = await supabase
          .from('records')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false })
          .limit(500); // Limit for performance

        if (recordsError) throw recordsError;
        if (records) {
          await saveRecordsToCache(records);
          await setLastSyncTime('records', Date.now());
        }

        // Sync incidents
        const { data: incidents, error: incidentsError } = await supabase
          .from('incidents')
          .select('*')
          .eq('child_id', childId);

        if (!incidentsError && incidents) {
          await saveIncidentsToCache(incidents);
          await setLastSyncTime('incidents', Date.now());
        }
      }

      console.log('✅ Sincronização do servidor completa!');
    } catch (error) {
      console.error('Erro ao sincronizar do servidor:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncPendingOperations,
    syncFromServer,
  };
}
