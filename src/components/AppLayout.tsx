import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import SupportFAB from '@/components/SupportFAB';
import AssistantChat from '@/components/AssistantChat';
import InstallPWA from '@/components/InstallPWA';
import TransactionForm from '@/components/TransactionForm';
import PremiumPlansDialog from '@/components/PremiumPlansDialog';
import SplashScreen from '@/components/SplashScreen';
import TrialBanner from '@/components/TrialBanner';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { getCurrentMonth } from '@/lib/format';
import type { TransactionType } from '@/types/finance';
import { toast } from 'sonner';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FREE_MONTHLY_LIMIT = 50;

export default function AppLayout() {
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { addTransaction, transactions } = useFinance();
  const { user, logout } = useAuth();
  const { isPremium, trial } = usePremiumStatus();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      {/* Global header with logout */}
      <header className="sticky top-0 z-30 flex items-center justify-end px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
              <User size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground truncate">
              {user?.email ?? '—'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive gap-2">
              <LogOut size={14} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <InstallPWA />
      <TrialBanner trial={trial} />
      <Outlet />
      <FloatingActionButton onClick={handleFabClick} />
      <SupportFAB />
      <AssistantChat />
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
