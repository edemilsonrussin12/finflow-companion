import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Sale } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

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
      setTransactions((txRes.data ?? []).map(mapTx));
      setSales((salesRes.data ?? []).map(mapSale));
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  const addTransaction = useCallback(async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
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
      recurrence_group_id: t.recurrenceGroupId ?? null,
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
    <FinanceContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, sales, addSale, updateSale, deleteSale, loading }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
