import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Sale } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentMonth } from '@/lib/format';

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

// Map DB row → app type
function mapTx(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    date: row.date,
    category: row.category,
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

/**
 * Given a recurring transaction, compute the next date based on frequency.
 * Returns ISO date string (YYYY-MM-DD).
 */
function getNextRecurrenceDate(dateStr: string, frequency: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  switch (frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
}

/**
 * Check if a date falls within or before the current month.
 */
function isDateDueByNow(dateStr: string): boolean {
  const now = new Date();
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // last day of current month
  const d = new Date(dateStr + 'T12:00:00');
  return d <= currentEnd;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // Compute available months from all data
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    months.add(getCurrentMonth());
    transactions.forEach(t => months.add(t.date.slice(0, 7)));
    sales.forEach(s => months.add(s.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [transactions, sales]);

  // Generate missing recurring transactions up to current month
  const generateRecurringEntries = useCallback(async (existingTx: Transaction[]) => {
    if (!user) return [];

    // Find all recurring (non-paused) transactions grouped by recurrence_group_id
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
      // Find the latest date in this group
      const sorted = groupTxs.sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      const frequency = latest.recurrenceFrequency!;

      let nextDate = getNextRecurrenceDate(latest.date, frequency);

      // Generate entries up to current month (max 12 to prevent runaway)
      let safety = 0;
      while (isDateDueByNow(nextDate) && safety < 12) {
        safety++;
        // Check if this date already exists in the group
        const alreadyExists = groupTxs.some(t => t.date === nextDate);
        if (alreadyExists) {
          nextDate = getNextRecurrenceDate(nextDate, frequency);
          continue;
        }

        // Insert into DB
        const { data, error } = await supabase.from('transactions').insert({
          user_id: user.id,
          type: latest.type,
          amount: latest.amount,
          date: nextDate,
          category: latest.category,
          description: latest.description,
          is_recurring: true,
          recurrence_frequency: frequency,
          recurrence_paused: false,
          recurrence_group_id: groupId,
        }).select().single();

        if (!error && data) {
          const mapped = mapTx(data);
          newEntries.push(mapped);
          groupTxs.push(mapped); // so next iteration sees it
        }

        nextDate = getNextRecurrenceDate(nextDate, frequency);
      }
    }

    return newEntries;
  }, [user]);

  // Fetch data when user changes
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

      // Generate any missing recurring entries
      const newEntries = await generateRecurringEntries(txList);
      setTransactions([...newEntries, ...txList].sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    };

    fetchAll();
  }, [user, generateRecurringEntries]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;

    // For recurring transactions, assign a recurrence_group_id if not present
    const groupId = t.isRecurring
      ? (t.recurrenceGroupId ?? crypto.randomUUID())
      : null;

    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      category: t.category,
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
