import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Sale } from '@/types/finance';

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  sales: Sale[];
  addSale: (s: Omit<Sale, 'id'>) => void;
  updateSale: (s: Sale) => void;
  deleteSale: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const TX_KEY = 'fincontrol-transactions';
const SALES_KEY = 'fincontrol-sales';

function load<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => load<Transaction>(TX_KEY));
  const [sales, setSales] = useState<Sale[]>(() => load<Sale>(SALES_KEY));

  useEffect(() => { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(SALES_KEY, JSON.stringify(sales)); }, [sales]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);
  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => prev.map(p => p.id === t.id ? t : p));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSale = useCallback((s: Omit<Sale, 'id'>) => {
    setSales(prev => [{ ...s, id: crypto.randomUUID() }, ...prev]);
  }, []);
  const updateSale = useCallback((s: Sale) => {
    setSales(prev => prev.map(p => p.id === s.id ? s : p));
  }, []);
  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <FinanceContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, sales, addSale, updateSale, deleteSale }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
