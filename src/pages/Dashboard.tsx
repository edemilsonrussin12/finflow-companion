import { useMemo, useState, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import {
  ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown,
  ShoppingBag, LogOut, Target, LineChart, PiggyBank, AlertTriangle,
  CheckCircle2, ChevronUp, ChevronDown, Minus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';
import FinancialScore from '@/components/FinancialScore';
import SpendingAnomalyRadar from '@/components/SpendingAnomalyRadar';
import WealthProjection from '@/components/WealthProjection';
import MoneyDistribution from '@/components/MoneyDistribution';
import OnboardingFlow from '@/components/OnboardingFlow';
import FinancialTimeline from '@/components/FinancialTimeline';
import SmartNotifications from '@/components/SmartNotifications';
import CourseRecommendation from '@/components/CourseRecommendation';
import EmptyState from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

const CHART_COLORS = [
  'hsl(153, 60%, 50%)',
  'hsl(200, 70%, 55%)',
  'hsl(280, 60%, 60%)',
  'hsl(35, 85%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(180, 55%, 45%)',
  'hsl(60, 70%, 50%)',
];

function ComparisonBadge({ current, previous, format = 'pct' }: { current: number; previous: number; format?: 'pct' | 'currency' }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
      <Minus size={10} /> 0%
    </span>
  );
  const isUp = diff > 0;
  const pct = previous !== 0 ? Math.abs((diff / previous) * 100) : 100;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isUp ? 'text-income bg-income/10' : 'text-expense bg-expense/10'}`}>
      {isUp ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      {format === 'currency' ? `${isUp ? '+' : '-'}${formatCurrency(Math.abs(diff))}` : `${isUp ? '+' : '-'}${pct.toFixed(0)}%`}
    </span>
  );
}

function ExpenseComparisonBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  if (diff === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
      <Minus size={10} /> 0%
    </span>
  );
  const isUp = diff > 0;
  const pct = previous !== 0 ? Math.abs((diff / previous) * 100) : 100;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${isUp ? 'text-expense bg-expense/10' : 'text-income bg-income/10'}`}>
      {isUp ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      {`${isUp ? '+' : '-'}${pct.toFixed(0)}%`}
    </span>
  );
}

export default function Dashboard() {
  const { transactions, sales, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { goals } = useGoals();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editingTx, setEditingTx] = useState<import('@/types/finance').Transaction | null>(null);

  // Current month data
  const monthTx = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);
  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const investment = useMemo(() => monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const saldoLivre = income - expense - investment;
  const monthlyRevenue = useMemo(() => sales.filter(s => s.date.startsWith(selectedMonth)).reduce((sum, s) => sum + s.totalValue, 0), [sales, selectedMonth]);

  // Previous month data
  const prevMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);

  const prevMonthTx = useMemo(() => transactions.filter(t => t.date.startsWith(prevMonth)), [transactions, prevMonth]);
  const prevIncome = useMemo(() => prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);
  const prevExpense = useMemo(() => prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);
  const prevInvestment = useMemo(() => prevMonthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [prevMonthTx]);

  const patrimonio = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    return allIncome + allSalesRevenue - allExpense;
  }, [transactions, sales]);

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
      const displayName = cat?.name ?? t.category;
      map.set(displayName, (map.get(displayName) ?? 0) + t.amount);
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
      const bestPct = best.currentAmount / best.targetAmount;
      return pct > bestPct ? g : best;
    });
  }, [activeGoals]);

  const financialStatus = useMemo(() => {
    if (monthTx.length === 0 && monthlyRevenue === 0) return null;
    const totalReceitas = income + monthlyRevenue;
    if (expense > totalReceitas) {
      return { type: 'warning' as const, message: 'Gastos acima da receita neste mês. Revise suas despesas.' };
    }
    if (saldoLivre > 0 && investment > prevInvestment) {
      return { type: 'positive' as const, message: 'Situação financeira positiva neste mês. Investimentos em alta!' };
    }
    if (saldoLivre > 0) {
      return { type: 'positive' as const, message: 'Mês com saldo positivo. Continue assim!' };
    }
    if (saldoLivre === 0) {
      return { type: 'neutral' as const, message: 'Receitas e despesas equilibradas neste mês.' };
    }
    return { type: 'warning' as const, message: 'Saldo livre negativo. Avalie cortes de despesas.' };
  }, [monthTx, monthlyRevenue, income, expense, saldoLivre, investment, prevInvestment]);

  const hasData = monthTx.length > 0 || monthlyRevenue > 0;
  const investmentRatio = income > 0 ? investment / income : 0;

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
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent transition-colors"
          title={user?.email ?? 'Sair'}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* Smart Notifications */}
      <SmartNotifications transactions={transactions} investment={investment} prevInvestment={prevInvestment} />

      {!hasData && (
        <EmptyState
          icon={Wallet}
          title="Comece sua jornada financeira"
          message="Adicione sua primeira receita ou despesa tocando no botão + abaixo para começar a acompanhar suas finanças."
        />
      )}

      {hasData && (
        <>
          {/* ───── 1: Financial Summary ───── */}
          <div className="card-premium rounded-2xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/15 glow-income">
                  <Wallet size={20} className="text-primary" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Saldo livre do mês</span>
              </div>
              <ComparisonBadge current={saldoLivre} previous={prevIncome - prevExpense - prevInvestment} format="currency" />
            </div>
            <p className={`text-4xl font-extrabold tabular-nums ${saldoLivre >= 0 ? 'text-emerald' : 'text-expense'}`} style={{
              textShadow: saldoLivre >= 0 ? '0 0 20px hsl(142,71%,45%,0.4)' : '0 0 20px hsl(0,72%,55%,0.4)'
            }}>
              {formatCurrency(saldoLivre)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card-income rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-income/15 w-fit glow-income"><ArrowUpRight size={18} className="text-income" /></div>
                <ComparisonBadge current={income} previous={prevIncome} />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Receitas</p>
              <p className="text-lg font-extrabold text-income tabular-nums">{formatCurrency(income)}</p>
            </div>
            <div className="card-expense rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-expense/15 w-fit"><ArrowDownLeft size={18} className="text-expense" /></div>
                <ExpenseComparisonBadge current={expense} previous={prevExpense} />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Despesas</p>
              <p className="text-lg font-extrabold text-expense tabular-nums">{formatCurrency(expense)}</p>
            </div>
            <div className="card-investment rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald/15 w-fit glow-emerald"><TrendingUp size={18} className="text-emerald" /></div>
                <ComparisonBadge current={investment} previous={prevInvestment} />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Investimentos</p>
              <p className="text-lg font-extrabold text-emerald tabular-nums">{formatCurrency(investment)}</p>
            </div>
            <div className="card-revenue rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-gold/15 w-fit glow-gold"><ShoppingBag size={18} className="text-gold" /></div>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Faturamento</p>
              <p className="text-lg font-extrabold text-gold tabular-nums">{formatCurrency(monthlyRevenue)}</p>
            </div>
          </div>

          {/* Patrimônio */}
          <div className="card-premium rounded-2xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald/15 glow-emerald">
                  <LineChart size={20} className="text-emerald" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Patrimônio total</span>
              </div>
              <ComparisonBadge current={patrimonio} previous={prevPatrimonio} format="currency" />
            </div>
            <p className={`text-3xl font-extrabold tabular-nums ${patrimonio >= 0 ? 'text-emerald' : 'text-expense'}`} style={{
              textShadow: patrimonio >= 0 ? '0 0 20px hsl(142,71%,45%,0.4)' : '0 0 20px hsl(0,72%,55%,0.4)'
            }}>
              {formatCurrency(patrimonio)}
            </p>
          </div>

          {/* ───── 2: Financial Score ───── */}
          {income > 0 && (
            <FinancialScore income={income} expense={expense} investment={investment} patrimonio={patrimonio} prevPatrimonio={prevPatrimonio} allTransactions={transactions} selectedMonth={selectedMonth} />
          )}

          {/* ───── Course Recommendation ───── */}
          {income > 0 && (
            <CourseRecommendation score={income > 0 ? Math.max(0, Math.min(100, 
              (expense / income < 0.70 ? 30 : expense / income <= 0.90 ? 20 : 10) +
              (investment / income >= 0.10 ? 30 : investment / income >= 0.05 ? 20 : 10) +
              (income - expense > 0 ? 20 : income - expense === 0 ? 10 : 0) +
              (patrimonio > prevPatrimonio ? 20 : patrimonio === prevPatrimonio ? 10 : 0)
            )) : 0} investmentRatio={investmentRatio} />
          )}

          {/* ───── 3: Money Distribution ───── */}
          {income > 0 && (
            <MoneyDistribution income={income} expense={expense} investment={investment} />
          )}

          {/* ───── 4: Financial Insights (Anomaly Radar + Status) ───── */}
          <SpendingAnomalyRadar currentMonthTx={monthTx} previousMonthTx={prevMonthTx} />

          {financialStatus && (
            <div className={`glass rounded-2xl p-4 flex items-start gap-3 ${
              financialStatus.type === 'positive' ? 'border-income/20' :
              financialStatus.type === 'warning' ? 'border-expense/20' : 'border-border/50'
            }`}>
              {financialStatus.type === 'positive' ? (
                <CheckCircle2 size={18} className="text-income shrink-0 mt-0.5" />
              ) : financialStatus.type === 'warning' ? (
                <AlertTriangle size={18} className="text-expense shrink-0 mt-0.5" />
              ) : (
                <PiggyBank size={18} className="text-muted-foreground shrink-0 mt-0.5" />
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">{financialStatus.message}</p>
            </div>
          )}

          {/* ───── 5: Charts ───── */}
          {categoryData.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Despesas por categoria</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ───── 6: Quick Insights ───── */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-sm font-medium">Resumo rápido</p>
            <div className="space-y-2.5">
              {topCategory && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-expense/10 shrink-0"><ShoppingBag size={14} className="text-expense" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maior gasto</p>
                    <p className="text-sm font-medium">{topCategory.name} <span className="text-muted-foreground font-normal">({formatCurrency(topCategory.value)})</span></p>
                  </div>
                </div>
              )}
              {investment > 0 && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><TrendingUp size={14} className="text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Investimento do mês</p>
                    <p className="text-sm font-medium">{formatCurrency(investment)}</p>
                  </div>
                </div>
              )}
              {closestGoal && (
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><Target size={14} className="text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Meta mais próxima</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{closestGoal.title}</p>
                      <span className="text-xs text-muted-foreground">({Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))}%)</span>
                    </div>
                    <Progress value={Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))} className="h-1.5 mt-1.5" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ───── 7: Goals Progress ───── */}
          {activeGoals.length > 0 && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <p className="text-sm font-medium">Metas financeiras</p>
                <span className="ml-auto text-xs text-muted-foreground">{activeGoals.length} ativa{activeGoals.length > 1 ? 's' : ''}</span>
              </div>
              {closestGoal && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{closestGoal.title}</span>
                    <span className="text-muted-foreground">{Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100))} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(closestGoal.currentAmount)}</span>
                    <span>{formatCurrency(closestGoal.targetAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───── Financial Evolution Timeline ───── */}
          <FinancialTimeline transactions={transactions} goals={goals} />

          {/* ───── 8: Wealth Projection ───── */}
          <WealthProjection transactions={transactions} />
        </>
      )}

      {/* Recent transactions */}
      <div>
        <p className="text-sm font-medium mb-3">Transações recentes</p>
        <div className="space-y-2">
          {recentTx.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação neste mês</p>
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
