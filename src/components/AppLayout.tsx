import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import InstallPWA from '@/components/InstallPWA';
import TransactionForm from '@/components/TransactionForm';
import { useFinance } from '@/contexts/FinanceContext';

export default function AppLayout() {
  const [showForm, setShowForm] = useState(false);
  const { addTransaction } = useFinance();
  const location = useLocation();
  const showFab = location.pathname !== '/investimentos';

  // Close form on route change to prevent stale overlays
  useEffect(() => {
    setShowForm(false);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      <InstallPWA />
      <Outlet />
      {showFab && <FloatingActionButton onClick={() => setShowForm(true)} />}
      <BottomNav />
      {showForm && (
        <TransactionForm
          onSubmit={addTransaction}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
