import { useMemo } from 'react';
import { Rocket } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/types/finance';

interface WealthProjectionProps {
  transactions: Transaction[];
}

function projectFutureValue(monthlyInvestment: number, monthlyReturn: number, months: number): number {
  if (monthlyReturn === 0) return monthlyInvestment * months;
  const r = monthlyReturn / 100;
  return monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r);
}

export default function WealthProjection({ transactions }: WealthProjectionProps) {
  const avgInvestment = useMemo(() => {
    // Get investments, group by month, take last 3 months
    const monthMap = new Map<string, number>();
    transactions
      .filter(t => t.type === 'investment')
      .forEach(t => {
        const m = t.date.slice(0, 7);
        monthMap.set(m, (monthMap.get(m) ?? 0) + t.amount);
      });

    const months = Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);
    if (months.length === 0) return 0;
    return months.reduce((s, [, v]) => s + v, 0) / months.length;
  }, [transactions]);

  const projections = useMemo(() => {
    if (avgInvestment <= 0) return null;
    const r = 1; // 1% monthly
    return [
      { label: '5 anos', value: projectFutureValue(avgInvestment, r, 60) },
      { label: '10 anos', value: projectFutureValue(avgInvestment, r, 120) },
      { label: '20 anos', value: projectFutureValue(avgInvestment, r, 240) },
    ];
  }, [avgInvestment]);

  if (!projections) return null;

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Rocket size={18} className="text-primary" />
        <span className="text-sm font-medium">Projeção de Patrimônio</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Se você continuar investindo <span className="text-foreground font-medium">{formatCurrency(avgInvestment)}/mês</span> com retorno de 1% a.m.:
      </p>
      <div className="grid grid-cols-3 gap-3">
        {projections.map(p => (
          <div key={p.label} className="glass rounded-xl p-3 text-center space-y-1">
            <p className="text-[10px] text-muted-foreground">{p.label}</p>
            <p className="text-sm font-bold text-income tabular-nums">{formatCurrency(p.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
