import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import InstallPWA from '@/components/InstallPWA';
import TransactionForm from '@/components/TransactionForm';
import PremiumPlansDialog from '@/components/PremiumPlansDialog';
import { useFinance } from '@/contexts/FinanceContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { getCurrentMonth } from '@/lib/format';
import type { TransactionType } from '@/types/finance';
import { toast } from 'sonner';

const FREE_MONTHLY_LIMIT = 50;

export default function AppLayout() {
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const { addTransaction, transactions } = useFinance();
  const { isPremium } = usePremiumStatus();
  const location = useLocation();

  const currentMonthCount = useMemo(() => {
    const month = getCurrentMonth();
    return transactions.filter(t => t.date.startsWith(month)).length;
  }, [transactions]);

  useEffect(() => {
    setFormType(null);
  }, [location.pathname]);

  const handleFabClick = (type: TransactionType) => {
    if (!isPremium && currentMonthCount >= FREE_MONTHLY_LIMIT) {
      toast.info('Limite de 50 registros mensais atingido.');
      setShowPlans(true);
      return;
    }
    setFormType(type);
  };

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      <InstallPWA />
      <Outlet />
      <FloatingActionButton onClick={handleFabClick} />
      <BottomNav />
      {formType && (
        <TransactionForm
          initialType={formType}
          onSubmit={t => addTransaction({ ...t, type: formType })}
          onClose={() => setFormType(null)}
        />
      )}
      <PremiumPlansDialog open={showPlans} onOpenChange={setShowPlans} />
    </div>
  );
}
