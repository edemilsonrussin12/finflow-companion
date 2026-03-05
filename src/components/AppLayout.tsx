import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import TransactionForm from '@/components/TransactionForm';
import { useFinance } from '@/contexts/FinanceContext';

export default function AppLayout() {
  const [showForm, setShowForm] = useState(false);
  const { addTransaction } = useFinance();
  const location = useLocation();
  const showFab = location.pathname !== '/investimentos';

  return (
    <div className="min-h-screen bg-background">
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
