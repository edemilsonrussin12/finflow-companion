import { useState, useMemo } from 'react';
import { calculateInvestment } from '@/lib/investment';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, Banknote, Percent, Briefcase } from 'lucide-react';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';
import WealthProjection from '@/components/WealthProjection';
import WealthSimulator from '@/components/WealthSimulator';
import PremiumGate from '@/components/PremiumGate';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import type { Transaction } from '@/types/finance';

export default function Investimentos() {
  const { transactions, sales, addTransaction, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { isPremium } = usePremiumStatus();

  const [initialAmount, setInitialAmount] = useState('1000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [monthlyRate, setMonthlyRate] = useState('1');
  const [months, setMonths] = useState('24');
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    const ia = parseFloat(initialAmount) || 0;
    const mc = parseFloat(monthlyContribution) || 0;
    const mr = parseFloat(monthlyRate) || 0;
    const m = parseInt(months) || 0;
    if (m <= 0) return null;
    return calculateInvestment({ initialAmount: ia, monthlyContribution: mc, monthlyRate: mr, months: m });
  }, [calculated, initialAmount, monthlyContribution, monthlyRate, months]);

  const monthInvestments = useMemo(
    () => transactions.filter(t => t.type === 'investment' && t.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, selectedMonth]
  );

  const totalInvested = useMemo(
    () => monthInvestments.reduce((s, t) => s + t.amount, 0),
    [monthInvestments]
  );

  const currentPatrimony = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    return allIncome + allSalesRevenue - allExpense;
  }, [transactions, sales]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">FinControl</p>
          <h1 className="text-xl font-bold">Investimentos</h1>
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

      {/* My Investments section — always visible */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            <p className="text-sm font-medium">Meus Investimentos</p>
          </div>
          <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(totalInvested)}</p>
        </div>

        {monthInvestments.length === 0 ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Nenhum investimento em {getMonthLabel(selectedMonth)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="text-primary border-primary/30 hover:bg-primary/10"
            >
              <TrendingUp size={14} className="mr-1.5" />
              Adicionar Investimento
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {monthInvestments.map(t => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onEdit={setEditingTx}
                onDelete={deleteTransaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Premium-only: Simulator, Calculator, Projection */}
      <PremiumGate isPremium={isPremium} label="Simulador de patrimônio, calculadora e projeção financeira são recursos Premium.">
        <WealthSimulator currentPatrimony={currentPatrimony} />

        {/* Investment Calculator */}
        <form onSubmit={handleCalculate} className="glass rounded-2xl p-5 space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={18} className="text-primary" />
            <span className="text-sm font-medium">Calculadora</span>
          </div>

          <div>
            <Label htmlFor="initial">Aporte inicial (R$)</Label>
            <Input id="initial" type="number" min="0" step="0.01" value={initialAmount}
              onChange={e => { setInitialAmount(e.target.value); setCalculated(false); }} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="monthly">Aporte mensal (R$)</Label>
            <Input id="monthly" type="number" min="0" step="0.01" value={monthlyContribution}
              onChange={e => { setMonthlyContribution(e.target.value); setCalculated(false); }} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="rate">Taxa de juros (% ao mês)</Label>
            <Input id="rate" type="number" min="0" step="0.01" value={monthlyRate}
              onChange={e => { setMonthlyRate(e.target.value); setCalculated(false); }} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="months">Período (meses)</Label>
            <Input id="months" type="number" min="1" step="1" value={months}
              onChange={e => { setMonths(e.target.value); setCalculated(false); }} className="mt-1" />
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
            Calcular
          </Button>
        </form>

        {result && (
          <>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="glass rounded-xl p-3 text-center">
                <TrendingUp size={16} className="mx-auto text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground">Valor final</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(result.finalValue)}</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Banknote size={16} className="mx-auto text-foreground mb-1" />
                <p className="text-[10px] text-muted-foreground">Investido</p>
                <p className="text-sm font-bold">{formatCurrency(result.totalInvested)}</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <Percent size={16} className="mx-auto text-income mb-1" />
                <p className="text-[10px] text-muted-foreground">Juros</p>
                <p className="text-sm font-bold text-income">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 mt-6">
              <p className="text-sm font-medium mb-3">Crescimento do investimento</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.monthlyData}>
                    <defs>
                      <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'value' ? 'Valor total' : 'Investido']}
                      contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)', fontSize: '12px' }}
                      labelFormatter={l => `Mês ${l}`}
                    />
                    <Area type="monotone" dataKey="invested" stroke="hsl(200, 70%, 55%)" fill="url(#gradInvested)" strokeWidth={2} />
                    <Area type="monotone" dataKey="value" stroke="hsl(153, 60%, 50%)" fill="url(#gradValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <div className="mt-6">
          <WealthProjection transactions={transactions} />
        </div>
      </PremiumGate>

      {editingTx && (
        <TransactionForm
          initial={editingTx}
          onSubmit={t => updateTransaction({ ...t, id: editingTx.id, type: 'investment' })}
          onClose={() => setEditingTx(null)}
        />
      )}

      {showForm && (
        <TransactionForm
          initialType="investment"
          onSubmit={t => addTransaction({ ...t, type: 'investment' })}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
