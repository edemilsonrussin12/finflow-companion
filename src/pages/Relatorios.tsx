import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { getCategoryById, getCategoryDisplayLabel } from '@/lib/categories';
import { exportTransactionsCSV, exportSalesCSV, exportReportCSV, exportReportExcel } from '@/lib/export';
import {
  FileText, Download, ArrowUpRight, ArrowDownLeft, Wallet,
  PiggyBank, ShoppingBag, Target, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';

const CHART_COLORS = [
  'hsl(153, 60%, 50%)', 'hsl(200, 70%, 55%)', 'hsl(280, 60%, 60%)',
  'hsl(35, 85%, 55%)', 'hsl(340, 65%, 55%)', 'hsl(180, 55%, 45%)', 'hsl(60, 70%, 50%)',
];

export default function Relatorios() {
  const { transactions, sales, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { goals } = useGoals();

  const monthTx = useMemo(() => transactions.filter(t => t.date.startsWith(selectedMonth)), [transactions, selectedMonth]);
  const monthSales = useMemo(() => sales.filter(s => s.date.startsWith(selectedMonth)), [sales, selectedMonth]);

  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const expense = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const investment = useMemo(() => monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const revenue = useMemo(() => monthSales.reduce((s, v) => s + v.totalValue, 0), [monthSales]);
  const totalIncome = income + revenue;
  const balance = totalIncome - expense - investment;
  const savingsRate = totalIncome > 0 ? ((totalIncome - expense - investment) / totalIncome) * 100 : 0;

  // Group by parent category for charts
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
  const activeGoals = goals.filter(g => g.status === 'active');
  const hasData = monthTx.length > 0 || revenue > 0;

  const handleExportCSV = () => {
    exportReportCSV(selectedMonth, totalIncome, expense, balance, savingsRate, topCategory, categoryData, goals);
  };

  const handleExportExcel = () => {
    exportReportExcel(selectedMonth, totalIncome, expense, balance, savingsRate, topCategory, categoryData, goals, monthTx);
  };

  const handleExportTransactions = () => exportTransactionsCSV(monthTx, selectedMonth);
  const handleExportSales = () => exportSalesCSV(monthSales, selectedMonth);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">FinControl</p>
          <h1 className="text-xl font-bold">Relatórios</h1>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-auto gap-2 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(m => (
              <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hasData ? (
        <div className="glass rounded-2xl p-8 text-center">
          <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum dado para {getMonthLabel(selectedMonth)}</p>
          <p className="text-muted-foreground text-xs mt-1">Adicione transações para gerar relatórios.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-sm font-medium">Resumo de {getMonthLabel(selectedMonth)}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight size={14} className="text-income" />
                  <span className="text-xs text-muted-foreground">Receitas</span>
                </div>
                <p className="text-sm font-bold text-income tabular-nums">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <ArrowDownLeft size={14} className="text-expense" />
                  <span className="text-xs text-muted-foreground">Despesas</span>
                </div>
                <p className="text-sm font-bold text-expense tabular-nums">{formatCurrency(expense)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Investimentos</span>
                </div>
                <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(investment)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Wallet size={14} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Saldo</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${balance >= 0 ? 'text-income' : 'text-expense'}`}>{formatCurrency(balance)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <PiggyBank size={14} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Economia</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${savingsRate >= 0 ? 'text-income' : 'text-expense'}`}>{savingsRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-primary" />
                <span className="text-xs text-muted-foreground">Maior categoria de gasto:</span>
                <span className="text-xs font-medium">{topCategory}</span>
              </div>
            </div>
          </div>

          {/* Category chart */}
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
                      contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((d, i) => {
                  const pct = expense > 0 ? ((d.value / expense) * 100).toFixed(1) : '0';
                  return (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums">{formatCurrency(d.value)}</span>
                        <span className="text-muted-foreground w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Goals progress */}
          {activeGoals.length > 0 && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                <p className="text-sm font-medium">Progresso das metas</p>
              </div>
              {activeGoals.map(g => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(g.currentAmount)}</span>
                      <span>{formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Export buttons */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Download size={18} className="text-primary" />
              <p className="text-sm font-medium">Exportar dados</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
                <FileText size={14} />
                Relatório CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5 text-xs">
                <FileText size={14} />
                Relatório Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportTransactions} className="gap-1.5 text-xs" disabled={monthTx.length === 0}>
                <Download size={14} />
                Transações CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSales} className="gap-1.5 text-xs" disabled={monthSales.length === 0}>
                <Download size={14} />
                Vendas CSV
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">Exportações filtradas por {getMonthLabel(selectedMonth)}</p>
          </div>
        </>
      )}
    </div>
  );
}
