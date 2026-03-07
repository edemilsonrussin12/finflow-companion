import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Sale } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMonth } from '@/lib/format';
import { migrateLegacyCategory, getCategoryById } from '@/lib/categories';

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id'>) => void;
  updateSale: (s: Sale) => void;
  deleteSale: (id: string) => void;
  loading: boolean;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/** Map DB row → app type, handling legacy category migration */
function mapTx(row: any): Transaction {
  let categoryId = row.category;
  let txType = row.type;

  // Migrate legacy category names to new IDs
  const existing = getCategoryById(categoryId);
  if (!existing) {
    const migrated = migrateLegacyCategory(categoryId);
    categoryId = migrated.category;
    if (txType !== 'income' && txType !== 'expense' && txType !== 'investment') {
      txType = migrated.type;
    }
  }

  return {
    id: row.id,
    type: txType,
    amount: Number(row.amount),
    date: row.date,
    category: categoryId,
    subCategory: row.sub_category ?? null,
    description: row.description,
    isRecurring: row.is_recurring,
    recurrenceFrequency: row.recurrence_frequency ?? undefined,
    recurrencePaused: row.recurrence_paused,
    recurrenceGroupId: row.recurrence_group_id ?? undefined,
  };
}

function mapSale(row: any): Sale {
  return {
    id: row.id,
    product: row.product,
    quantity: row.quantity,
    totalValue: Number(row.total_value),
    date: row.date,
  };
}

function getNextRecurrenceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  switch (frequency) {
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

function isDateDueByNow(dateStr: string): boolean {
  const now = new Date();
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const d = new Date(dateStr + 'T12:00:00');
  return d <= currentEnd;
}

/** Generate last 12 months + any months from data */
function buildAvailableMonths(transactions: Transaction[], sales: Sale[]): string[] {
  const months = new Set<string>();
  const now = new Date();
  // Always include last 12 months
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  // Also include any month that has data
  transactions.forEach(t => months.add(t.date.slice(0, 7)));
  sales.forEach(s => months.add(s.date.slice(0, 7)));
  return Array.from(months).sort().reverse();
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const availableMonths = React.useMemo(
    () => buildAvailableMonths(transactions, sales),
    [transactions, sales]
  );

  const generateRecurringEntries = useCallback(async (existingTx: Transaction[]) => {
    if (!user) return [];
    const recurringGroups = new Map<string, Transaction[]>();
    for (const tx of existingTx) {
      if (tx.isRecurring && !tx.recurrencePaused && tx.recurrenceGroupId && tx.recurrenceFrequency) {
        const group = recurringGroups.get(tx.recurrenceGroupId) ?? [];
        group.push(tx);
        recurringGroups.set(tx.recurrenceGroupId, group);
      }
    }

    const newEntries: Transaction[] = [];

    for (const [groupId, groupTxs] of recurringGroups) {
      const sorted = groupTxs.sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      const frequency = latest.recurrenceFrequency!;
      let nextDate = getNextRecurrenceDate(latest.date, frequency);
      let safety = 0;
      while (isDateDueByNow(nextDate) && safety < 12) {
        safety++;
        const alreadyExists = groupTxs.some(t => t.date === nextDate);
        if (alreadyExists) {
          nextDate = getNextRecurrenceDate(nextDate, frequency);
          continue;
        }
        const { data, error } = await supabase.from('transactions').insert({
          user_id: user.id,
          type: latest.type,
          amount: latest.amount,
          date: nextDate,
          category: latest.category,
          sub_category: latest.subCategory ?? null,
          description: latest.description,
          is_recurring: true,
          recurrence_frequency: frequency,
          recurrence_paused: false,
          recurrence_group_id: groupId,
        }).select().single();
        if (!error && data) {
          const mapped = mapTx(data);
          newEntries.push(mapped);
          groupTxs.push(mapped);
        }
        nextDate = getNextRecurrenceDate(nextDate, frequency);
      }
    }
    return newEntries;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setSales([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchAll = async () => {
      const [txRes, salesRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('sales').select('*').order('date', { ascending: false }),
      ]);
      const txList = (txRes.data ?? []).map(mapTx);
      setSales((salesRes.data ?? []).map(mapSale));
      const newEntries = await generateRecurringEntries(txList);
      setTransactions([...newEntries, ...txList].sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };
    fetchAll();
  }, [user, generateRecurringEntries]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const groupId = t.isRecurring ? (t.recurrenceGroupId ?? crypto.randomUUID()) : null;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      category: t.category,
      sub_category: t.subCategory ?? null,
      description: t.description,
      is_recurring: t.isRecurring,
      recurrence_frequency: t.recurrenceFrequency ?? null,
      recurrence_paused: t.recurrencePaused ?? false,
      recurrence_group_id: groupId,
    }).select().single();
    if (!error && data) {
      setTransactions(prev => [mapTx(data), ...prev]);
    }
  }, [user]);

  const updateTransaction = useCallback(async (t: Transaction) => {
    const { data, error } = await supabase.from('transactions').update({
      type: t.type,
      amount: t.amount,
      date: t.date,
      category: t.category,
      sub_category: t.subCategory ?? null,
      description: t.description,
      is_recurring: t.isRecurring,
      recurrence_frequency: t.recurrenceFrequency ?? null,
      recurrence_paused: t.recurrencePaused ?? false,
      recurrence_group_id: t.recurrenceGroupId ?? null,
    }).eq('id', t.id).select().single();
    if (!error && data) {
      setTransactions(prev => prev.map(p => p.id === t.id ? mapTx(data) : p));
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const addSale = useCallback(async (s: Omit<Sale, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('sales').insert({
      user_id: user.id,
      product: s.product,
      quantity: s.quantity,
      total_value: s.totalValue,
      date: s.date,
    }).select().single();
    if (!error && data) {
      setSales(prev => [mapSale(data), ...prev]);
    }
  }, [user]);

  const updateSale = useCallback(async (s: Sale) => {
    const { data, error } = await supabase.from('sales').update({
      product: s.product,
      quantity: s.quantity,
      total_value: s.totalValue,
      date: s.date,
    }).eq('id', s.id).select().single();
    if (!error && data) {
      setSales(prev => prev.map(p => p.id === s.id ? mapSale(data) : p));
    }
  }, []);

  const deleteSale = useCallback(async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) {
      setSales(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  return (
    <FinanceContext.Provider value={{
      transactions, addTransaction, updateTransaction, deleteTransaction,
      sales, addSale, updateSale, deleteSale,
      loading, selectedMonth, setSelectedMonth, availableMonths,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
