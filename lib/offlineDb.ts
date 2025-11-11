import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Record, Child, Incident } from '@/types/record';

interface CubbiDB extends DBSchema {
  records: {
    key: string;
    value: Record & { _pendingSync?: boolean };
    indexes: { 'by-child': string; 'by-date': string };
  };
  children: {
    key: string;
    value: Child & { _pendingSync?: boolean };
  };
  incidents: {
    key: string;
    value: Incident & { _pendingSync?: boolean };
    indexes: { 'by-child': string };
  };
  pendingOperations: {
    key: number;
    value: {
      id?: number;
      type: 'create' | 'update' | 'delete';
      table: 'records' | 'children' | 'incidents';
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      lastSync?: number;
    };
  };
}

let dbInstance: IDBPDatabase<CubbiDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<CubbiDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CubbiDB>('cubbi-offline', 3, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Records store
      if (!db.objectStoreNames.contains('records')) {
        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
        recordStore.createIndex('by-child', 'child_id');
        recordStore.createIndex('by-date', 'created_at');
      }

      // Children store
      if (!db.objectStoreNames.contains('children')) {
        db.createObjectStore('children', { keyPath: 'id' });
      }

      // Incidents store
      if (!db.objectStoreNames.contains('incidents')) {
        const incidentStore = db.createObjectStore('incidents', { keyPath: 'id' });
        incidentStore.createIndex('by-child', 'child_id');
      }

      // Pending operations store
      if (!db.objectStoreNames.contains('pendingOperations')) {
        const pendingStore = db.createObjectStore('pendingOperations', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        pendingStore.createIndex('by-timestamp', 'timestamp');
      }

      // Metadata store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Records operations
export async function saveRecordsToCache(records: Record[]) {
  const db = await getDB();
  const tx = db.transaction('records', 'readwrite');
  await Promise.all(records.map(record => tx.store.put(record)));
  await tx.done;
}

export async function getRecordsFromCache(childId?: string): Promise<Record[]> {
  const db = await getDB();
  if (childId) {
    return db.getAllFromIndex('records', 'by-child', childId);
  }
  return db.getAll('records');
}

export async function addRecordToCache(record: Record) {
  const db = await getDB();
  await db.put('records', record);
}

export async function updateRecordInCache(record: Record) {
  const db = await getDB();
  await db.put('records', record);
}

export async function deleteRecordFromCache(id: string) {
  const db = await getDB();
  await db.delete('records', id);
}

// Children operations
export async function saveChildrenToCache(children: Child[]) {
  const db = await getDB();
  const tx = db.transaction('children', 'readwrite');
  await Promise.all(children.map(child => tx.store.put(child)));
  await tx.done;
}

export async function getChildrenFromCache(): Promise<Child[]> {
  const db = await getDB();
  return db.getAll('children');
}

export async function getChildFromCache(id: string): Promise<Child | undefined> {
  const db = await getDB();
  return db.get('children', id);
}

// Incidents operations
export async function saveIncidentsToCache(incidents: Incident[]) {
  const db = await getDB();
  const tx = db.transaction('incidents', 'readwrite');
  await Promise.all(incidents.map(incident => tx.store.put(incident)));
  await tx.done;
}

export async function getIncidentsFromCache(childId?: string): Promise<Incident[]> {
  const db = await getDB();
  if (childId) {
    return db.getAllFromIndex('incidents', 'by-child', childId);
  }
  return db.getAll('incidents');
}

// Pending operations
export async function addPendingOperation(
  type: 'create' | 'update' | 'delete',
  table: 'records' | 'children' | 'incidents',
  data: any
) {
  const db = await getDB();
  await db.add('pendingOperations', {
    type,
    table,
    data,
    timestamp: Date.now(),
  });
}

export async function getPendingOperations() {
  const db = await getDB();
  return db.getAllFromIndex('pendingOperations', 'by-timestamp');
}

export async function clearPendingOperation(id: number) {
  const db = await getDB();
  await db.delete('pendingOperations', id);
}

export async function clearAllPendingOperations() {
  const db = await getDB();
  const tx = db.transaction('pendingOperations', 'readwrite');
  await tx.store.clear();
  await tx.done;
}

// Metadata operations
export async function setLastSyncTime(table: string, timestamp: number) {
  const db = await getDB();
  await db.put('metadata', {
    key: `lastSync-${table}`,
    value: timestamp,
    lastSync: timestamp,
  });
}

export async function getLastSyncTime(table: string): Promise<number | null> {
  const db = await getDB();
  const metadata = await db.get('metadata', `lastSync-${table}`);
  return metadata?.value || null;
}

// Clear all cache
export async function clearAllCache() {
  const db = await getDB();
  const stores = ['records', 'children', 'incidents', 'pendingOperations', 'metadata'] as const;
  
  for (const store of stores) {
    const tx = db.transaction(store, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
}
