import { useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingDown, TrendingUp, ShoppingBag, LogOut, Target, LineChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';
import FinancialInsights from '@/components/FinancialInsights';

const CHART_COLORS = [
  'hsl(153, 60%, 50%)',
  'hsl(200, 70%, 55%)',
  'hsl(280, 60%, 60%)',
  'hsl(35, 85%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(180, 55%, 45%)',
  'hsl(60, 70%, 50%)',
];

export default function Dashboard() {
  const { transactions, sales, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { goals } = useGoals();
  const { user, logout } = useAuth();
  const [editingTx, setEditingTx] = useState<import('@/types/finance').Transaction | null>(null);

  const monthTx = useMemo(
    () => transactions.filter(t => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const investment = useMemo(() => monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const balance = income - expense - investment;

  const monthlyRevenue = useMemo(
    () => sales.filter(s => s.date.startsWith(selectedMonth)).reduce((sum, s) => sum + s.totalValue, 0),
    [sales, selectedMonth]
  );

  // Group expenses by PARENT category for charts
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = getCategoryById(t.category);
      const displayName = cat?.name ?? t.category;
      map.set(displayName, (map.get(displayName) ?? 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const topCategory = categoryData[0]?.name ?? '—';
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

  const netWorthData = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allInvestment = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    const netWorth = allIncome + allSalesRevenue - allExpense - allInvestment;

    const prevIncome = transactions.filter(t => t.type === 'income' && t.date < selectedMonth + '-32').reduce((s, t) => s + t.amount, 0)
      - transactions.filter(t => t.type === 'income' && t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const prevExpense = transactions.filter(t => t.type === 'expense' && t.date < selectedMonth + '-32').reduce((s, t) => s + t.amount, 0)
      - transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const prevInvestment = transactions.filter(t => t.type === 'investment' && t.date < selectedMonth + '-32').reduce((s, t) => s + t.amount, 0)
      - transactions.filter(t => t.type === 'investment' && t.date.startsWith(selectedMonth)).reduce((s, t) => s + t.amount, 0);
    const prevSales = sales.filter(s => s.date < selectedMonth + '-32').reduce((s, v) => s + v.totalValue, 0)
      - sales.filter(s => s.date.startsWith(selectedMonth)).reduce((s, v) => s + v.totalValue, 0);
    const prevNetWorth = prevIncome + prevSales - prevExpense - prevInvestment;
    const growth = netWorth - prevNetWorth;
    const pct = prevNetWorth !== 0 ? (growth / Math.abs(prevNetWorth)) * 100 : (netWorth !== 0 ? 100 : 0);

    return { netWorth, growth, pct, investment: allInvestment };
  }, [transactions, sales, selectedMonth]);

  const hasData = monthTx.length > 0 || monthlyRevenue > 0;

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
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

      {!hasData && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhum dado para {getMonthLabel(selectedMonth)}</p>
        </div>
      )}

      {categoryData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-3">Despesas por categoria</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }}
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

      <div className="glass rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Saldo do mês</span>
        </div>
        <p className={`text-4xl font-extrabold tabular-nums ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-income/10 w-fit"><ArrowUpRight size={20} className="text-income" /></div>
          <p className="text-xs text-muted-foreground">Receitas</p>
          <p className="text-lg font-bold text-income tabular-nums">{formatCurrency(income)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-expense/10 w-fit"><ArrowDownLeft size={20} className="text-expense" /></div>
          <p className="text-xs text-muted-foreground">Despesas</p>
          <p className="text-lg font-bold text-expense tabular-nums">{formatCurrency(expense)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-primary/10 w-fit"><TrendingUp size={20} className="text-primary" /></div>
          <p className="text-xs text-muted-foreground">Investimentos</p>
          <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(investment)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-primary/10 w-fit"><ShoppingBag size={20} className="text-primary" /></div>
          <p className="text-xs text-muted-foreground">Faturamento</p>
          <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(monthlyRevenue)}</p>
        </div>
      </div>

      {/* Net worth widget */}
      <div className="glass rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <LineChart size={18} className="text-primary" />
          <p className="text-sm font-medium">Patrimônio</p>
        </div>
        <p className={`text-2xl font-extrabold tabular-nums ${netWorthData.netWorth >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(netWorthData.netWorth)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={netWorthData.growth >= 0 ? 'text-income' : 'text-expense'}>
            {netWorthData.growth >= 0 ? '+' : ''}{formatCurrency(netWorthData.growth)}
          </span>
          <span className={netWorthData.pct >= 0 ? 'text-income' : 'text-expense'}>
            ({netWorthData.pct >= 0 ? '+' : ''}{netWorthData.pct.toFixed(1)}%)
          </span>
          <span>este mês</span>
        </div>
      </div>

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

      <FinancialInsights />

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
