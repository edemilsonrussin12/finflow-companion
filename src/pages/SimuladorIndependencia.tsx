import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Target, TrendingUp, Clock, DollarSign, Rocket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectionPoint {
  year: number;
  patrimonio: number;
  meta: number;
}

interface SimulationResult {
  annualExpense: number;
  requiredPatrimony: number;
  yearsToGoal: number;
  finalValue: number;
  chartData: ProjectionPoint[];
}

function simulate(
  monthlyExpense: number,
  alreadyInvested: number,
  monthlyInvestment: number,
  annualRate: number
): SimulationResult {
  const annualExpense = monthlyExpense * 12;
  const requiredPatrimony = annualExpense / 0.04;
  const monthlyRate = annualRate / 100 / 12;

  const maxYears = 60;
  const chartData: ProjectionPoint[] = [];
  let current = alreadyInvested;
  let yearsToGoal = maxYears;

  chartData.push({ year: 0, patrimonio: current, meta: requiredPatrimony });

  for (let y = 1; y <= maxYears; y++) {
    for (let m = 0; m < 12; m++) {
      current = current * (1 + monthlyRate) + monthlyInvestment;
    }
    chartData.push({ year: y, patrimonio: current, meta: requiredPatrimony });

    if (current >= requiredPatrimony && yearsToGoal === maxYears) {
      yearsToGoal = y;
    }
  }

  // Trim chart to yearsToGoal + 5 (or max 60)
  const trimTo = Math.min(yearsToGoal + 5, maxYears);
  const trimmedData = chartData.filter(d => d.year <= trimTo);

  return {
    annualExpense,
    requiredPatrimony,
    yearsToGoal,
    finalValue: current,
    chartData: trimmedData,
  };
}

function getMotivationalMessage(yearsToGoal: number, monthlyInvestment: number): string {
  if (yearsToGoal <= 10) {
    return `🚀 Você está mais perto do que imagina. Mantendo esse ritmo, sua independência financeira pode chegar em ${yearsToGoal} anos.`;
  }
  if (yearsToGoal <= 20) {
    return `💪 Você já começou sua jornada. Pequenos ajustes no valor investido por mês podem acelerar muito sua independência financeira.`;
  }
  if (monthlyInvestment < 500) {
    return `📈 Seu plano já começou. Aumentar seus aportes mensais pode reduzir bastante o tempo até sua liberdade financeira.`;
  }
  return `🎯 Continue firme! Consistência é a chave. Cada real investido hoje acelera seu caminho para a independência financeira.`;
}

export default function SimuladorIndependencia() {
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [invested, setInvested] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('8');
  const [calculated, setCalculated] = useState(false);

  const result = useMemo<SimulationResult | null>(() => {
    if (!calculated) return null;
    const e = parseFloat(expense) || 0;
    const inv = parseFloat(invested) || 0;
    const m = parseFloat(monthly) || 0;
    const r = parseFloat(rate) || 0;
    if (e <= 0) return null;
    return simulate(e, inv, m, r);
  }, [calculated, expense, invested, monthly, rate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Rocket size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Simulador de Independência</h1>
            <p className="text-xs text-muted-foreground">Descubra quando você pode viver de renda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator size={16} className="text-primary" />
              Seus dados financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fi-income">Renda mensal (R$)</Label>
              <Input
                id="fi-income"
                type="number"
                min="0"
                step="0.01"
                placeholder="5.000"
                value={income}
                onChange={e => { setIncome(e.target.value); setCalculated(false); }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fi-expense">Gasto mensal (R$)</Label>
              <Input
                id="fi-expense"
                type="number"
                min="0"
                step="0.01"
                placeholder="3.000"
                value={expense}
                onChange={e => { setExpense(e.target.value); setCalculated(false); }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fi-invested">Valor já investido (R$)</Label>
              <Input
                id="fi-invested"
                type="number"
                min="0"
                step="0.01"
                placeholder="10.000"
                value={invested}
                onChange={e => { setInvested(e.target.value); setCalculated(false); }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fi-monthly">Valor investido por mês (R$)</Label>
              <Input
                id="fi-monthly"
                type="number"
                min="0"
                step="0.01"
                placeholder="1.000"
                value={monthly}
                onChange={e => { setMonthly(e.target.value); setCalculated(false); }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fi-rate">Taxa de rendimento anual (%)</Label>
              <Input
                id="fi-rate"
                type="number"
                min="0"
                step="0.1"
                placeholder="8"
                value={rate}
                onChange={e => { setRate(e.target.value); setCalculated(false); }}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold gap-2">
              <Target size={16} />
              Calcular minha independência
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-primary/20">
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <Target size={18} className="text-primary mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrimônio necessário</p>
                <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(result.requiredPatrimony)}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <Clock size={18} className="text-primary mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tempo estimado</p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {result.yearsToGoal >= 60 ? '60+ anos' : `${result.yearsToGoal} anos`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <DollarSign size={18} className="text-muted-foreground mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gasto anual</p>
                <p className="text-sm font-bold tabular-nums">{formatCurrency(result.annualExpense)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center space-y-1">
                <TrendingUp size={18} className="text-muted-foreground mx-auto" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Acumulado final</p>
                <p className="text-sm font-bold tabular-nums">{formatCurrency(result.finalValue)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                Evolução do patrimônio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <defs>
                      <linearGradient id="gradFI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={v => `${v}a`}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'patrimonio' ? 'Patrimônio' : 'Meta',
                      ]}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px',
                      }}
                      labelFormatter={l => `Ano ${l}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="patrimonio"
                      stroke="hsl(var(--primary))"
                      fill="url(#gradFI)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="meta"
                      stroke="hsl(var(--destructive))"
                      fill="none"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Patrimônio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-[10px] text-muted-foreground">Meta</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motivational message */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm leading-relaxed text-center">
                {getMotivationalMessage(result.yearsToGoal, parseFloat(monthly) || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
