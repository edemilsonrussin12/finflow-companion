import { useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getCurrentMonth, getMonthLabel } from '@/lib/format';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';

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
  const { transactions, updateTransaction, deleteTransaction } = useFinance();
  const [editingTx, setEditingTx] = useState<import('@/types/finance').Transaction | null>(null);
  const currentMonth = getCurrentMonth();

  const monthTx = useMemo(
    () => transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const balance = income - expense;

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTx]);

  const topCategory = categoryData[0]?.name ?? '—';
  const recentTx = useMemo(() => [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [monthTx]);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <p className="text-sm text-muted-foreground">FinControl</p>
        <h1 className="text-xl font-bold">{getMonthLabel(currentMonth)}</h1>
      </div>

      {/* Pie chart — top */}
      {categoryData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-3">Despesas por categoria</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
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

      {/* Balance card */}
      <div className="glass rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Saldo do mês</span>
        </div>
        <p className={`text-4xl font-extrabold tabular-nums ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Income / Expense / Top category cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-income/10 w-fit">
            <ArrowUpRight size={20} className="text-income" />
          </div>
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-lg font-bold text-income tabular-nums">{formatCurrency(income)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="p-2.5 rounded-xl bg-expense/10 w-fit">
            <ArrowDownLeft size={20} className="text-expense" />
          </div>
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-lg font-bold text-expense tabular-nums">{formatCurrency(expense)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-2 col-span-2">
          <div className="p-2.5 rounded-xl bg-expense/10 w-fit">
            <TrendingDown size={20} className="text-expense" />
          </div>
          <p className="text-xs text-muted-foreground">Maior gasto</p>
          <p className="text-base font-bold">{topCategory}</p>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <p className="text-sm font-medium mb-3">Transações recentes</p>
        <div className="space-y-2">
          {recentTx.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação ainda</p>
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
