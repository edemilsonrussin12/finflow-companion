import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface MoneyDistributionProps {
  income: number;
  expense: number;
  investment: number;
}

const COLORS = [
  'hsl(var(--expense))',
  'hsl(var(--primary))',
  'hsl(var(--income))',
];

export default function MoneyDistribution({ income, expense, investment }: MoneyDistributionProps) {
  const data = useMemo(() => {
    if (income <= 0) return [];
    const freeBalance = Math.max(0, income - expense - investment);
    return [
      { name: 'Despesas', value: expense, pct: ((expense / income) * 100).toFixed(0) },
      { name: 'Investimentos', value: investment, pct: ((investment / income) * 100).toFixed(0) },
      { name: 'Saldo livre', value: freeBalance, pct: ((freeBalance / income) * 100).toFixed(0) },
    ].filter(d => d.value > 0);
  }, [income, expense, investment]);

  if (data.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <PieChartIcon size={18} className="text-primary" />
        <span className="text-sm font-medium">Distribuição do dinheiro</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={4} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
            {d.name}: <span className="font-medium text-foreground">{d.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
