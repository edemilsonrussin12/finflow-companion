import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp } from 'lucide-react';

interface WealthSimulatorProps {
  currentPatrimony: number;
}

interface ProjectionPoint {
  year: number;
  value: number;
}

function projectWealth(patrimony: number, monthlyInvestment: number, annualRate: number, years: number): ProjectionPoint[] {
  const monthlyRate = annualRate / 100 / 12;
  const points: ProjectionPoint[] = [{ year: 0, value: patrimony }];
  let current = patrimony;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      current = current * (1 + monthlyRate) + monthlyInvestment;
    }
    points.push({ year: y, value: current });
  }

  return points;
}

export default function WealthSimulator({ currentPatrimony }: WealthSimulatorProps) {
  const [monthlyInvestment, setMonthlyInvestment] = useState('500');
  const [annualRate, setAnnualRate] = useState('8');
  const [calculated, setCalculated] = useState(false);

  const data = useMemo(() => {
    if (!calculated) return null;
    const mi = parseFloat(monthlyInvestment) || 0;
    const ar = parseFloat(annualRate) || 0;
    return projectWealth(currentPatrimony, mi, ar, 20);
  }, [calculated, currentPatrimony, monthlyInvestment, annualRate]);

  const milestones = useMemo(() => {
    if (!data) return null;
    return {
      y5: data.find(d => d.year === 5)?.value ?? 0,
      y10: data.find(d => d.year === 10)?.value ?? 0,
      y20: data.find(d => d.year === 20)?.value ?? 0,
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <form
        onSubmit={e => { e.preventDefault(); setCalculated(true); }}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={18} className="text-primary" />
          <span className="text-sm font-medium">Simulador de Crescimento Patrimonial</span>
        </div>

        <div className="glass rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Patrimônio atual</span>
          <span className="text-sm font-bold text-primary tabular-nums">{formatCurrency(currentPatrimony)}</span>
        </div>

        <div>
          <Label htmlFor="sim-monthly">Aporte mensal (R$)</Label>
          <Input id="sim-monthly" type="number" min="0" step="0.01" value={monthlyInvestment}
            onChange={e => { setMonthlyInvestment(e.target.value); setCalculated(false); }} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="sim-rate">Taxa de retorno anual (%)</Label>
          <Input id="sim-rate" type="number" min="0" step="0.1" value={annualRate}
            onChange={e => { setAnnualRate(e.target.value); setCalculated(false); }} className="mt-1" />
        </div>

        <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
          Simular Crescimento
        </Button>
      </form>

      {milestones && data && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '5 anos', value: milestones.y5 },
              { label: '10 anos', value: milestones.y10 },
              { label: '20 anos', value: milestones.y20 },
            ].map(m => (
              <div key={m.label} className="glass rounded-xl p-3 text-center space-y-1">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-bold text-income tabular-nums">{formatCurrency(m.value)}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-primary" />
              <p className="text-sm font-medium">Projeção de crescimento</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="gradWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(153, 60%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${v}a`} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Patrimônio']}
                    contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)', fontSize: '12px' }}
                    labelFormatter={l => `Ano ${l}`}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(153, 60%, 50%)" fill="url(#gradWealth)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
