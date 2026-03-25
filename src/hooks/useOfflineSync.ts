import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QUEUE_KEY = 'fincontrol_offline_queue';

export interface OfflineEntry {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  payload: Record<string, any>;
  timestamp: string;
  synced: boolean;
}

function loadQueue(): OfflineEntry[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const syncingRef = useRef(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    setPendingCount(loadQueue().filter(e => !e.synced).length);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const enqueue = useCallback((table: string, action: 'insert' | 'update' | 'delete', payload: Record<string, any>) => {
    const queue = loadQueue();
    const entry: OfflineEntry = {
      id: crypto.randomUUID(),
      table,
      action,
      payload,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    queue.push(entry);
    saveQueue(queue);
    setPendingCount(queue.filter(e => !e.synced).length);
    toast({ title: 'Salvo offline', description: 'Será sincronizado quando houver internet.' });
    return entry;
  }, [toast]);

  const syncAll = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    const queue = loadQueue();
    const pending = queue.filter(e => !e.synced);
    if (pending.length === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const entry of pending) {
      try {
        let error: any = null;
        if (entry.action === 'insert') {
          const res = await supabase.from(entry.table as any).insert(entry.payload as any);
          error = res.error;
        } else if (entry.action === 'update') {
          const { id, ...rest } = entry.payload;
          const res = await supabase.from(entry.table as any).update(rest as any).eq('id', id);
          error = res.error;
        } else if (entry.action === 'delete') {
          const res = await supabase.from(entry.table as any).delete().eq('id', entry.payload.id);
          error = res.error;
        }
        if (!error) {
          entry.synced = true;
          successCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    saveQueue(queue);
    setPendingCount(queue.filter(e => !e.synced).length);
    syncingRef.current = false;
    setSyncing(false);

    if (successCount > 0) {
      toast({ title: 'Dados sincronizados', description: `${successCount} registro(s) sincronizado(s) com sucesso.` });
    }
    if (errorCount > 0) {
      toast({ variant: 'destructive', title: 'Erro ao sincronizar', description: `${errorCount} registro(s) falharam. Tentaremos novamente.` });
    }
  }, [toast]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncAll();
    }
  }, [isOnline, syncAll]);

  // Periodic retry every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && loadQueue().some(e => !e.synced)) {
        syncAll();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [syncAll]);

  const clearSynced = useCallback(() => {
    const queue = loadQueue().filter(e => !e.synced);
    saveQueue(queue);
    setPendingCount(queue.length);
  }, []);

  return { isOnline, pendingCount, syncing, enqueue, syncAll, clearSynced };
}
