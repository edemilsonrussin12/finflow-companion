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

      {/* Balance card */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          <span className="text-sm text-muted-foreground">Saldo do mês</span>
        </div>
        <p className={`text-3xl font-bold tabular-nums ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(balance)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-income/10 rounded-xl p-3">
            <ArrowUpRight size={16} className="text-income" />
            <div>
              <p className="text-[10px] text-muted-foreground">Entradas</p>
              <p className="text-sm font-semibold text-income">{formatCurrency(income)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-expense/10 rounded-xl p-3">
            <ArrowDownLeft size={16} className="text-expense" />
            <div>
              <p className="text-[10px] text-muted-foreground">Saídas</p>
              <p className="text-sm font-semibold text-expense">{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top category */}
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-expense/10">
          <TrendingDown size={18} className="text-expense" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Maior gasto</p>
          <p className="text-sm font-semibold">{topCategory}</p>
        </div>
      </div>

      {/* Pie chart */}
      {categoryData.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Despesas por categoria</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
