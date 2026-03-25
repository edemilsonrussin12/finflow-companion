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
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { getCurrentMonth } from '@/lib/format';
import type { TransactionType } from '@/types/finance';
import { toast } from 'sonner';
import { LogOut, User, Bot, WifiOff, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

const FREE_MONTHLY_LIMIT = 50;

// Pages where the assistant FAB should show (instead of inline button)
const ASSISTANT_FAB_PAGES = ['/engenharia'];

// Pages where the FAB (+) action button exists
const FAB_PAGES = ['/', '/financas', '/gastos', '/investimentos', '/vendas', '/metas', '/patrimonio', '/relatorios', '/planilha'];

export default function AppLayout() {
  const [formType, setFormType] = useState<TransactionType | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const { addTransaction, transactions } = useFinance();
  const { user, logout } = useAuth();
  const { isPremium, trial } = usePremiumStatus();
  const location = useLocation();
  const navigate = useNavigate();

  // Load display name
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => setUserName(data?.display_name || ''));
  }, [user]);

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

  // Determine visibility rules
  const path = location.pathname;
  const showAssistantFAB = ASSISTANT_FAB_PAGES.some(p => path === p || path.startsWith(p + '/'));
  const hasFAB = FAB_PAGES.some(p => path === p);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const { isOnline, pendingCount, syncing } = useOfflineSync();

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden">
      {/* Offline / sync indicator */}
      {(!isOnline || pendingCount > 0) && (
        <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 text-xs font-medium ${
          !isOnline ? 'bg-destructive/90 text-destructive-foreground' : 'bg-primary/90 text-primary-foreground'
        }`}>
          {!isOnline ? (
            <><WifiOff size={14} /> Sem internet – dados salvos offline</>
          ) : syncing ? (
            <><RefreshCw size={14} className="animate-spin" /> Sincronizando {pendingCount} registro(s)...</>
          ) : (
            <><RefreshCw size={14} /> {pendingCount} registro(s) pendente(s)</>
          )}
        </div>
      )}

      {/* Global header with logout */}
      <header className={`sticky top-0 z-30 flex items-center justify-end px-4 md:px-8 py-2 ${(!isOnline || pendingCount > 0) ? 'mt-7' : ''}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
              <User size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground truncate">
              {userName || user?.email?.split('@')[0] || '—'}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-[10px] text-muted-foreground truncate">
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
      <Outlet context={{ openAssistant: () => setChatOpen(true) }} />
      <FloatingActionButton onClick={handleFabClick} />
      <SupportFAB />

      {/* Assistant FAB - only on Engenharia da Riqueza */}
      {showAssistantFAB && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className={`fixed z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-cyan shadow-xl flex items-center justify-center hover:scale-105 transition-transform ${
            hasFAB ? 'bottom-36 right-4' : 'bottom-20 right-4'
          }`}
          aria-label="Assistente FinControl"
        >
          <Bot size={26} className="text-primary-foreground" />
        </button>
      )}

      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} />
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
