import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import InstallPWA from '@/components/InstallPWA';
import TransactionForm from '@/components/TransactionForm';
import { useFinance } from '@/contexts/FinanceContext';
import type { TransactionType } from '@/types/finance';

export default function AppLayout() {
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const { addTransaction } = useFinance();
  const location = useLocation();
  const showFab = true;

  useEffect(() => {
    setFormType(null);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      <InstallPWA />
      <Outlet />
      {showFab && <FloatingActionButton onClick={(type) => setFormType(type)} />}
      <BottomNav />
      {formType && (
        <TransactionForm
          initialType={formType}
          onSubmit={addTransaction}
          onClose={() => setFormType(null)}
        />
      )}
    </div>
  );
}
