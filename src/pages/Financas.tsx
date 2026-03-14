import { useMemo, lazy, Suspense } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import {
  ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, LineChart,
  Receipt, PiggyBank, BarChart3, Grid3X3, ShoppingBag
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import AIInsights from '@/components/AIInsights';
import AskAssistantButton from '@/components/AskAssistantButton';

const CHART_COLORS = [
  'hsl(153, 60%, 50%)', 'hsl(200, 70%, 55%)', 'hsl(280, 60%, 60%)',
  'hsl(35, 85%, 55%)', 'hsl(340, 65%, 55%)', 'hsl(180, 55%, 45%)', 'hsl(60, 70%, 50%)',
];

export default function Financas() {
  const navigate = useNavigate();
  const { transactions, sales, selectedMonth, setSelectedMonth, availableMonths } = useFinance();

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

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = getCategoryById(t.category);
      const displayName = cat?.name ?? t.category;
      map.set(displayName, (map.get(displayName) ?? 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTx]);

  // Evolution data: last 6 months
  const evolutionData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const months: { month: string; label: string; receitas: number; despesas: number; investimentos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const txs = transactions.filter(t => t.date.startsWith(key));
      months.push({
        month: key,
        label,
        receitas: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        despesas: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        investimentos: txs.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0),
      });
    }
    return months;
  }, [transactions, selectedMonth]);

  const hasEvolutionData = evolutionData.some(d => d.receitas > 0 || d.despesas > 0 || d.investimentos > 0);

  const quickLinks = [
    { label: 'Gastos', icon: Receipt, path: '/gastos', color: 'text-expense' },
    { label: 'Investimentos', icon: TrendingUp, path: '/investimentos', color: 'text-emerald' },
    { label: 'Patrimônio', icon: LineChart, path: '/patrimonio', color: 'text-primary' },
    { label: 'Vendas', icon: ShoppingBag, path: '/vendas', color: 'text-gold' },
    { label: 'Metas', icon: PiggyBank, path: '/metas', color: 'text-cyan' },
    { label: 'Relatórios', icon: BarChart3, path: '/relatorios', color: 'text-primary' },
    { label: 'Planilha', icon: Grid3X3, path: '/planilha', color: 'text-muted-foreground' },
  ];

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wallet size={22} className="text-primary" />
            Finanças
          </h1>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="text-sm text-muted-foreground border-none p-0 h-auto shadow-none focus:ring-0 w-auto gap-1">
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

      {/* Summary cards */}
      <div className="card-premium rounded-2xl p-5 space-y-1">
        <p className="text-xs text-muted-foreground">Saldo livre do mês</p>
        <p className={`text-3xl font-extrabold tabular-nums ${saldoLivre >= 0 ? 'text-emerald' : 'text-expense'}`}>
          {formatCurrency(saldoLivre)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-income rounded-2xl p-4 space-y-1">
          <div className="p-2 rounded-xl bg-income/15 w-fit"><ArrowUpRight size={16} className="text-income" /></div>
          <p className="text-[11px] text-muted-foreground">Receitas</p>
          <p className="text-lg font-bold text-income tabular-nums">{formatCurrency(income)}</p>
        </div>
        <div className="card-expense rounded-2xl p-4 space-y-1">
          <div className="p-2 rounded-xl bg-expense/15 w-fit"><ArrowDownLeft size={16} className="text-expense" /></div>
          <p className="text-[11px] text-muted-foreground">Despesas</p>
          <p className="text-lg font-bold text-expense tabular-nums">{formatCurrency(expense)}</p>
        </div>
        <div className="card-investment rounded-2xl p-4 space-y-1">
          <div className="p-2 rounded-xl bg-emerald/15 w-fit"><TrendingUp size={16} className="text-emerald" /></div>
          <p className="text-[11px] text-muted-foreground">Investimentos</p>
          <p className="text-lg font-bold text-emerald tabular-nums">{formatCurrency(investment)}</p>
        </div>
        <div className="card-revenue rounded-2xl p-4 space-y-1">
          <div className="p-2 rounded-xl bg-gold/15 w-fit"><ShoppingBag size={16} className="text-gold" /></div>
          <p className="text-[11px] text-muted-foreground">Faturamento</p>
          <p className="text-lg font-bold text-gold tabular-nums">{formatCurrency(monthlyRevenue)}</p>
        </div>
      </div>

      {/* Patrimônio */}
      <div className="card-premium rounded-2xl p-5 space-y-1">
        <div className="flex items-center gap-2">
          <LineChart size={16} className="text-emerald" />
          <p className="text-xs text-muted-foreground">Patrimônio total</p>
        </div>
        <p className={`text-2xl font-extrabold tabular-nums ${patrimonio >= 0 ? 'text-emerald' : 'text-expense'}`}>
          {formatCurrency(patrimonio)}
        </p>
      </div>

      {/* Evolution chart */}
      {hasEvolutionData && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-3">Evolução (últimos 6 meses)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolutionData} barGap={2} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={45}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <Bar dataKey="receitas" fill="hsl(153, 60%, 50%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="despesas" fill="hsl(0, 70%, 55%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="investimentos" fill="hsl(200, 70%, 55%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(153, 60%, 50%)' }} /> Receitas
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(0, 70%, 55%)' }} /> Despesas
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full" style={{ background: 'hsl(200, 70%, 55%)' }} /> Investimentos
            </span>
          </div>
        </div>
      )}

      {/* Category chart */}
      {categoryData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium mb-3">Despesas por categoria</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
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

      {/* Quick links */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Acesso rápido</p>
        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-accent/10 transition-colors text-left"
            >
              <link.icon size={18} className={link.color} />
              <span className="text-sm font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AIInsights page="financas" />
    </div>
  );
}
