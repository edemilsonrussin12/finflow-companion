import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import PremiumGate from '@/components/PremiumGate';

interface MonthData {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
  accumulated: number;
}

export default function Patrimonio() {
  const { transactions, sales } = useFinance();
  const { isPremium } = usePremiumStatus();

  const monthlyEvolution = useMemo<MonthData[]>(() => {
    const monthSet = new Set<string>();
    transactions.forEach(t => monthSet.add(t.date.slice(0, 7)));
    sales.forEach(s => monthSet.add(s.date.slice(0, 7)));
    const sortedMonths = Array.from(monthSet).sort();
    let accumulated = 0;
    return sortedMonths.map(month => {
      const monthTx = transactions.filter(t => t.date.startsWith(month));
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const invest = monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
      const salesRevenue = sales.filter(s => s.date.startsWith(month)).reduce((s, v) => s + v.totalValue, 0);
      const monthBalance = income + salesRevenue - expense - invest;
      accumulated += monthBalance;
      return { month, label: getMonthLabel(month), income: income + salesRevenue, expense, balance: monthBalance, accumulated };
    });
  }, [transactions, sales]);

  const currentNetWorth = monthlyEvolution.length > 0 ? monthlyEvolution[monthlyEvolution.length - 1].accumulated : 0;
  const previousNetWorth = monthlyEvolution.length > 1 ? monthlyEvolution[monthlyEvolution.length - 2].accumulated : 0;
  const monthGrowth = currentNetWorth - previousNetWorth;
  const growthPct = previousNetWorth !== 0 ? ((monthGrowth / Math.abs(previousNetWorth)) * 100) : currentNetWorth !== 0 ? 100 : 0;
  const chartData = monthlyEvolution.map(d => ({
    name: d.month.slice(5) + '/' + d.month.slice(0, 4),
    patrimonio: d.accumulated,
    receitas: d.income,
    despesas: d.expense,
  }));

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="text-sm text-muted-foreground">FinControl</p>
        <h1 className="text-xl font-bold">Evolução Patrimonial</h1>
      </div>

      <PremiumGate isPremium={isPremium} label="A evolução patrimonial completa com gráficos e projeções é um recurso Premium.">
        {monthlyEvolution.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Wallet size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma transação registrada ainda.</p>
            <p className="text-muted-foreground text-xs mt-1">Adicione entradas e saídas para acompanhar sua evolução patrimonial.</p>
          </div>
        ) : (
          <>
            <div className="glass rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={20} className="text-primary" />
                <span className="text-sm text-muted-foreground">Patrimônio atual</span>
              </div>
              <p className={`text-4xl font-extrabold tabular-nums ${currentNetWorth >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(currentNetWorth)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="p-2.5 rounded-xl bg-income/10 w-fit">
                  {monthGrowth >= 0 ? <ArrowUpRight size={20} className="text-income" /> : <ArrowDownLeft size={20} className="text-expense" />}
                </div>
                <p className="text-xs text-muted-foreground">Crescimento mensal</p>
                <p className={`text-lg font-bold tabular-nums ${monthGrowth >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(monthGrowth)}</p>
              </div>
              <div className="glass rounded-2xl p-4 space-y-2">
                <div className="p-2.5 rounded-xl bg-primary/10 w-fit">
                  {growthPct >= 0 ? <TrendingUp size={20} className="text-income" /> : <TrendingDown size={20} className="text-expense" />}
                </div>
                <p className="text-xs text-muted-foreground">Variação</p>
                <p className={`text-lg font-bold tabular-nums ${growthPct >= 0 ? 'text-income' : 'text-expense'}`}>{growthPct >= 0 ? '+' : ''}{growthPct.toFixed(1)}%</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Evolução do patrimônio</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradPatrimonio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 25%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(210, 10%, 60%)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(210, 10%, 60%)' }} tickFormatter={(v: number) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }} labelStyle={{ color: 'hsl(210, 10%, 60%)' }} />
                    <Area type="monotone" dataKey="patrimonio" stroke="hsl(153, 60%, 50%)" fill="url(#gradPatrimonio)" strokeWidth={2} name="Patrimônio" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-medium mb-3">Evolução mensal</p>
              <div className="space-y-3">
                {[...monthlyEvolution].reverse().map(d => (
                  <div key={d.month} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{d.label}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="text-income">+{formatCurrency(d.income)}</span>
                        <span className="text-expense">-{formatCurrency(d.expense)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold tabular-nums ${d.balance >= 0 ? 'text-income' : 'text-expense'}`}>{d.balance >= 0 ? '+' : ''}{formatCurrency(d.balance)}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{formatCurrency(d.accumulated)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </PremiumGate>
    </div>
  );
}
