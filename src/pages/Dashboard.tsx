import { useMemo, useEffect, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import {
  ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp,
  Target, LineChart, ClipboardList, Package, Users, Sparkles,
  Receipt
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmptyState from '@/components/EmptyState';
import OnboardingFlow from '@/components/OnboardingFlow';
import AIInsights from '@/components/AIInsights';
import { useNavigate } from 'react-router-dom';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { supabase } from '@/integrations/supabase/client';

function getGreeting(firstName: string) {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { greeting: `Bom dia, ${firstName}`, subtitle: 'Vamos organizar suas finanças hoje.' };
  if (h >= 12 && h < 18) return { greeting: `Boa tarde, ${firstName}`, subtitle: 'Confira como estão suas finanças.' };
  return { greeting: `Boa noite, ${firstName}`, subtitle: 'Veja o resumo financeiro do seu dia.' };
}

export default function Dashboard() {
  const { transactions, sales, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { goals } = useGoals();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recheck: recheckPremium } = usePremiumStatus();
  const [recentBudgets, setRecentBudgets] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => { recheckPremium(); }, [recheckPremium]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const name = data?.display_name || user.email?.split('@')[0] || '';
        setDisplayName(name.split(' ')[0]);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('budgets')
      .select('id, client_name, total, status, quote_number, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentBudgets(data ?? []));
  }, [user]);

  const monthTx = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);
  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const investment = useMemo(() => monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const saldoLivre = income - expense - investment;

  const patrimonio = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    return allIncome + allSalesRevenue - allExpense;
  }, [transactions, sales]);

  const hasData = monthTx.length > 0;

  const statusLabel: Record<string, string> = { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Rejeitado', paid: 'Pago', waiting: 'Aguardando' };
  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground', sent: 'bg-primary/10 text-primary',
    waiting: 'bg-gold/10 text-gold', approved: 'bg-emerald-500/10 text-emerald-400',
    rejected: 'bg-expense/10 text-expense', paid: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <OnboardingFlow />

      {/* Greeting + Month */}
      {displayName && (() => {
        const { greeting, subtitle } = getGreeting(displayName);
        return (
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-foreground">{greeting}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        );
      })()}

      <div className="flex items-center justify-between">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="text-lg font-bold border-none p-0 h-auto shadow-none focus:ring-0 w-auto gap-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(m => (
              <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hasData && (
        <EmptyState
          icon={Wallet}
          title="Comece sua jornada financeira"
          message="Adicione sua primeira receita ou despesa tocando no botão + abaixo."
        />
      )}

      {hasData && (
        <>
          {/* Saldo */}
          <div className="card-premium rounded-2xl p-5 space-y-1">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">Saldo livre do mês</span>
            </div>
            <p className={`text-3xl font-extrabold tabular-nums ${saldoLivre >= 0 ? 'text-emerald' : 'text-expense'}`}>
              {formatCurrency(saldoLivre)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-income" />
                <span className="text-[10px] text-muted-foreground">Receitas</span>
              </div>
              <p className="text-sm font-bold text-income tabular-nums">{formatCurrency(income)}</p>
            </div>
            <div className="glass rounded-xl p-3 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft size={14} className="text-expense" />
                <span className="text-[10px] text-muted-foreground">Despesas</span>
              </div>
              <p className="text-sm font-bold text-expense tabular-nums">{formatCurrency(expense)}</p>
            </div>
            <div className="glass rounded-xl p-3 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald" />
                <span className="text-[10px] text-muted-foreground">Investimentos</span>
              </div>
              <p className="text-sm font-bold text-emerald tabular-nums">{formatCurrency(investment)}</p>
            </div>
            <div className="glass rounded-xl p-3 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <LineChart size={14} className="text-emerald" />
                <span className="text-[10px] text-muted-foreground">Patrimônio</span>
              </div>
              <p className="text-sm font-bold text-emerald tabular-nums">{formatCurrency(patrimonio)}</p>
            </div>
          </div>
        </>
      )}

      {/* Acessos rápidos */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Acesso rápido</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Finanças', icon: Receipt, path: '/financas', color: 'text-primary' },
            { label: 'Orçamentos', icon: ClipboardList, path: '/orcamentos', color: 'text-gold' },
            { label: 'Catálogo', icon: Package, path: '/catalogo', color: 'text-cyan' },
            { label: 'Clientes', icon: Users, path: '/clientes', color: 'text-emerald' },
            { label: 'Engenharia', icon: Sparkles, path: '/engenharia', color: 'text-gold' },
            { label: 'Metas', icon: Target, path: '/metas', color: 'text-primary' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-accent/10 transition-colors"
            >
              <item.icon size={20} className={item.color} />
              <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Últimos orçamentos */}
      {recentBudgets.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Últimos orçamentos</p>
            <button onClick={() => navigate('/orcamentos')} className="text-xs text-primary hover:underline">Ver todos</button>
          </div>
          <div className="space-y-2">
            {recentBudgets.map(b => (
              <div key={b.id} className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{b.client_name || 'Sem cliente'}</p>
                  <p className="text-[10px] text-muted-foreground">#{String(b.quote_number).padStart(5, '0')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[b.status] || statusColor.draft}`}>
                    {statusLabel[b.status] || b.status}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    R$ {Number(b.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
