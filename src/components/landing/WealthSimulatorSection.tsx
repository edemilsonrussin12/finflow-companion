import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

function projectWealth(monthly: number, rate: number, years: number) {
  const monthlyRate = rate / 100 / 12;
  const data = [];
  let value = 0;

  for (let year = 0; year <= years; year++) {
    data.push({ year, value: Math.round(value), invested: monthly * 12 * year });
    for (let m = 0; m < 12; m++) {
      value = value * (1 + monthlyRate) + monthly;
    }
  }

  return data;
}

export default function WealthSimulatorSection() {
  const { ref, inView } = useInView();
  const [monthly, setMonthly] = useState(1000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(20);

  const data = useMemo(() => projectWealth(monthly, rate, years), [monthly, rate, years]);
  const finalValue = data[data.length - 1]?.value || 0;
  const totalInvested = monthly * 12 * years;
  const totalInterest = finalValue - totalInvested;

  return (
    <section className="py-20 px-6">
      <div ref={ref} className={`max-w-6xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald/20 text-emerald px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calculator size={16} />
            Simulador Interativo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simule o crescimento do{' '}
            <span className="text-emerald">seu patrimônio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja como seus investimentos podem crescer ao longo do tempo com o poder dos juros compostos
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Inputs */}
          <div className="glass rounded-3xl p-8 space-y-6">
            <div>
              <Label className="text-sm mb-2 block">Investimento mensal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Number(e.target.value))}
                  className="pl-10 h-12 text-lg"
                  min={100}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Rentabilidade anual (%)</Label>
              <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="h-12 text-lg"
                min={1}
                max={30}
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Período (anos)</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="h-12 text-lg"
                min={1}
                max={40}
              />
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Investido</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="bg-emerald/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Juros Ganhos</p>
                <p className="text-lg font-bold text-emerald">{formatCurrency(totalInterest)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gold/20 to-gold/10 rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Patrimônio Final</p>
              <p className="text-3xl font-bold text-gold">{formatCurrency(finalValue)}</p>
              <div className="flex items-center justify-center gap-1 text-emerald text-sm mt-2">
                <TrendingUp size={14} />
                em {years} anos
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald" size={20} />
              Projeção de Crescimento
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--emerald))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--emerald))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="year" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `${v}a`}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'value' ? 'Patrimônio' : 'Investido'
                    ]}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--emerald))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 text-center">
              <Link to="/cadastro">
                <Button size="lg" className="fab-glow">
                  Acompanhar meu progresso real
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
