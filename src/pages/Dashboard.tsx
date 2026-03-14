import { useMemo, useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import {
  ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp,
  ShoppingBag, Target, LineChart, PiggyBank, AlertTriangle,
  CheckCircle2, ClipboardList, Package, Users, Sparkles,
  Plus, FileText, Receipt
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';
import FinancialScore from '@/components/FinancialScore';
import SmartNotifications from '@/components/SmartNotifications';
import CourseRecommendation from '@/components/CourseRecommendation';
import EmptyState from '@/components/EmptyState';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useNavigate } from 'react-router-dom';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { transactions, sales, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { goals } = useGoals();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingTx, setEditingTx] = useState<import('@/types/finance').Transaction | null>(null);
  const { recheck: recheckPremium, isPremium } = usePremiumStatus();
  const [recentBudgets, setRecentBudgets] = useState<any[]>([]);

  useEffect(() => { recheckPremium(); }, [recheckPremium]);

  // Load recent budgets
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
  const monthlyRevenue = useMemo(() => sales.filter(s => s.date.startsWith(selectedMonth)).reduce((sum, s) => sum + s.totalValue, 0), [sales, selectedMonth]);

  const patrimonio = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    return allIncome + allSalesRevenue - allExpense;
  }, [transactions, sales]);

  const prevMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthTx = useMemo(() => transactions.filter(t => t.date.startsWith(prevMonth)), [transactions, prevMonth]);
  const prevIncome = useMemo(() => prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);
  const prevExpense = useMemo(() => prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);
  const prevInvestment = useMemo(() => prevMonthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);
  const prevPatrimonio = useMemo(() => {
    const beforeCurrentIncome = transactions.filter(t => t.type === 'income' && !t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const beforeCurrentExpense = transactions.filter(t => t.type === 'expense' && !t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const beforeCurrentSales = sales.filter(s => !s.date.startsWith(selectedMonth)).reduce((s, v) => s + v.totalValue, 0);
    return beforeCurrentIncome + beforeCurrentSales - beforeCurrentExpense;
  }, [transactions, sales, selectedMonth]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = getCategoryById(t.category);
      map.set(cat?.name ?? t.category, (map.get(cat?.name ?? t.category) ?? 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const topCategory = categoryData[0];
  const recentTx = useMemo(() => [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [monthTx]);
  const activeGoals = goals.filter(g => g.status === 'active');
  const closestGoal = useMemo(() => {
    if (activeGoals.length === 0) return null;
    return activeGoals.reduce((best, g) => {
      const pct = g.currentAmount / g.targetAmount;
      return pct > best.currentAmount / best.targetAmount ? g : best;
    });
  }, [activeGoals]);

  const investmentRatio = income > 0 ? investment / income : 0;
  const hasData = monthTx.length > 0 || monthlyRevenue > 0;

  const statusLabel: Record<string, string> = { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Rejeitado', paid: 'Pago' };
  const statusColor: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground', sent: 'bg-primary/10 text-primary',
    approved: 'bg-emerald-500/10 text-emerald-400', rejected: 'bg-expense/10 text-expense', paid: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      <OnboardingFlow />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">FinControl</p>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="text-xl font-bold border-none p-0 h-auto shadow-none focus:ring-0 w-auto gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SmartNotifications transactions={transactions} investment={investment} prevInvestment={prevInvestment} />

      {!hasData && (
        <EmptyState
          icon={Wallet}
          title="Comece sua jornada financeira"
          message="Adicione sua primeira receita ou despesa tocando no botão + abaixo."
        />
      )}

      {hasData && (
        <>
          {/* BLOCO 1: Resumo geral */}
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

      {/* BLOCO 2: Acessos rápidos */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Acesso rápido</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Finanças', icon: Receipt, path: '/financas', color: 'text-primary' },
            { label: 'Orçamento', icon: ClipboardList, path: '/orcamentos', color: 'text-gold' },
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

      {/* BLOCO 3: Resumo de orçamentos */}
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
                  <p className="text-[10px] text-muted-foreground">
                    #{String(b.quote_number).padStart(5, '0')}
                  </p>
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

      {/* BLOCO 4: Indicadores inteligentes */}
      {hasData && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium">Indicadores</p>
          <div className="space-y-2">
            {topCategory && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-expense/10"><ShoppingBag size={14} className="text-expense" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Maior gasto</p>
                  <p className="text-xs font-medium">{topCategory.name} ({formatCurrency(topCategory.value)})</p>
                </div>
              </div>
            )}
            {expense > 0 && prevExpense > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  {expense > prevExpense
                    ? <AlertTriangle size={14} className="text-expense" />
                    : <CheckCircle2 size={14} className="text-income" />
                  }
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">vs. mês anterior</p>
                  <p className="text-xs font-medium">
                    {expense > prevExpense ? 'Gastos aumentaram' : 'Gastos reduziram'}{' '}
                    {prevExpense > 0 ? `${Math.abs(Math.round(((expense - prevExpense) / prevExpense) * 100))}%` : ''}
                  </p>
                </div>
              </div>
            )}
            {patrimonio !== prevPatrimonio && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald/10"><TrendingUp size={14} className="text-emerald" /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Patrimônio</p>
                  <p className="text-xs font-medium">
                    {patrimonio > prevPatrimonio ? 'Crescimento' : 'Redução'} de {formatCurrency(Math.abs(patrimonio - prevPatrimonio))}
                  </p>
                </div>
              </div>
            )}
            {closestGoal && (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10"><Target size={14} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">Meta mais próxima</p>
                  <p className="text-xs font-medium">{closestGoal.title} ({Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))}%)</p>
                  <Progress value={Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))} className="h-1 mt-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Score */}
      {income > 0 && (
        <FinancialScore income={income} expense={expense} investment={investment} patrimonio={patrimonio} prevPatrimonio={prevPatrimonio} allTransactions={transactions} selectedMonth={selectedMonth} />
      )}

      {/* Course Recommendation */}
      {income > 0 && (
        <CourseRecommendation score={income > 0 ? Math.max(0, Math.min(100,
          (expense / income < 0.70 ? 30 : expense / income <= 0.90 ? 20 : 10) +
          (investment / income >= 0.10 ? 30 : investment / income >= 0.05 ? 20 : 10) +
          (income - expense > 0 ? 20 : income - expense === 0 ? 10 : 0) +
          (patrimonio > prevPatrimonio ? 20 : patrimonio === prevPatrimonio ? 10 : 0)
        )) : 0} investmentRatio={investmentRatio} />
      )}

      {/* Recent transactions */}
      <div>
        <p className="text-sm font-medium mb-3">Transações recentes</p>
        <div className="space-y-2">
          {recentTx.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação neste mês</p>
          )}
          {recentTx.map(t => (
            <TransactionItem key={t.id} transaction={t} onEdit={setEditingTx} onDelete={deleteTransaction} />
          ))}
        </div>
      </div>

      {editingTx && (
        <TransactionForm
          initial={editingTx}
          onSubmit={t => updateTransaction({ ...t, id: editingTx.id })}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
