import { useMemo } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCategoryById } from '@/lib/categories';
import type { Transaction } from '@/types/finance';

interface SpendingAnomalyRadarProps {
  currentMonthTx: Transaction[];
  previousMonthTx: Transaction[];
}

interface Anomaly {
  category: string;
  current: number;
  previous: number;
  pctChange: number;
}

export default function SpendingAnomalyRadar({ currentMonthTx, previousMonthTx }: SpendingAnomalyRadarProps) {
  const anomalies = useMemo<Anomaly[]>(() => {
    const aggregate = (txs: Transaction[]) => {
      const map = new Map<string, number>();
      txs.filter(t => t.type === 'expense').forEach(t => {
        const cat = getCategoryById(t.category);
        const name = cat?.name ?? t.category;
        map.set(name, (map.get(name) ?? 0) + t.amount);
      });
      return map;
    };

    const current = aggregate(currentMonthTx);
    const previous = aggregate(previousMonthTx);

    const results: Anomaly[] = [];
    current.forEach((val, cat) => {
      const prev = previous.get(cat) ?? 0;
      if (prev > 0) {
        const pctChange = ((val - prev) / prev) * 100;
        if (pctChange > 30) {
          results.push({ category: cat, current: val, previous: prev, pctChange });
        }
      }
    });

    return results.sort((a, b) => b.pctChange - a.pctChange).slice(0, 3);
  }, [currentMonthTx, previousMonthTx]);

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-primary" />
        <span className="text-sm font-medium">Radar de Gastos</span>
      </div>
      {anomalies.length === 0 ? (
        <div className="flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-income shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus gastos estão consistentes com os meses anteriores.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {anomalies.map(a => (
            <div key={a.category} className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-expense/10 shrink-0">
                <AlertCircle size={14} className="text-expense" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gastos com <span className="text-foreground font-medium">{a.category}</span> aumentaram{' '}
                <span className="text-expense font-semibold">{a.pctChange.toFixed(0)}%</span> em relação ao mês passado.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
