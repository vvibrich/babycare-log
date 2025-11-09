import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Record } from '@/types/record';
import {
  getRecordsFromCache,
  addRecordToCache,
  updateRecordInCache,
  deleteRecordFromCache,
  saveRecordsToCache,
  addPendingOperation,
} from '@/lib/offlineDb';

// Generate UUID using crypto API
const generateUUID = () => {
  return crypto.randomUUID();
};

export function useOfflineRecords(childId: string | null) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    if (!childId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isOnline) {
        // Try to fetch from server
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('child_id', childId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setRecords(data);
          // Save to cache
          await saveRecordsToCache(data);
        }
      } else {
        // Fetch from cache when offline
        const cachedRecords = await getRecordsFromCache(childId);
        setRecords(cachedRecords);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      // Fallback to cache on error
      try {
        const cachedRecords = await getRecordsFromCache(childId);
        setRecords(cachedRecords);
      } catch (cacheError) {
        console.error('Error fetching from cache:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [childId, isOnline]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Create record
  const createRecord = useCallback(async (recordData: Omit<Record, 'id' | 'created_at'>) => {
    const tempId = generateUUID();
    const now = new Date().toISOString();
    
    const newRecord: Record = {
      ...recordData,
      id: tempId,
      created_at: now,
    };

    // Optimistically update UI
    setRecords(prev => [newRecord, ...prev]);

    try {
      if (isOnline) {
        // Try to create on server
        const { data, error } = await supabase
          .from('records')
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;

        // Update with real record from server
        if (data) {
          await addRecordToCache(data);
          setRecords(prev => prev.map(r => r.id === tempId ? data : r));
          return data;
        }
      } else {
        // Save to cache and pending operations
        await addRecordToCache(newRecord);
        await addPendingOperation('create', 'records', recordData);
        return newRecord;
      }
    } catch (error) {
      console.error('Error creating record:', error);
      // Save to cache and pending operations for retry
      await addRecordToCache(newRecord);
      await addPendingOperation('create', 'records', recordData);
      return newRecord;
    }
  }, [isOnline]);

  // Update record
  const updateRecord = useCallback(async (id: string, updates: Partial<Record>) => {
    // Optimistically update UI
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

    try {
      if (isOnline) {
        const { data, error } = await supabase
          .from('records')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          await updateRecordInCache(data);
          setRecords(prev => prev.map(r => r.id === id ? data : r));
          return data;
        }
      } else {
        // Update cache and add to pending
        const updatedRecord = records.find(r => r.id === id);
        if (updatedRecord) {
          const newRecord = { ...updatedRecord, ...updates };
          await updateRecordInCache(newRecord);
          await addPendingOperation('update', 'records', { id, ...updates });
        }
      }
    } catch (error) {
      console.error('Error updating record:', error);
      // Add to pending operations for retry
      await addPendingOperation('update', 'records', { id, ...updates });
    }
  }, [isOnline, records]);

  // Delete record
  const deleteRecord = useCallback(async (id: string) => {
    // Optimistically update UI
    setRecords(prev => prev.filter(r => r.id !== id));

    try {
      if (isOnline) {
        const { error } = await supabase
          .from('records')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await deleteRecordFromCache(id);
      } else {
        // Delete from cache and add to pending
        await deleteRecordFromCache(id);
        await addPendingOperation('delete', 'records', { id });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      // Add to pending operations for retry
      await addPendingOperation('delete', 'records', { id });
    }
  }, [isOnline]);

  return {
    records,
    loading,
    isOnline,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
}
