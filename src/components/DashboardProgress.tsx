import { useMemo } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import type { Transaction } from '@/types/finance';

interface DashboardProgressProps {
  transactions: Transaction[];
  selectedMonth: string;
}

const MOTIVATIONAL = [
  'Pequenos hábitos criam grandes resultados.',
  'Consistência financeira gera liberdade.',
  'Cada registro é um passo rumo ao controle total.',
];

export default function DashboardProgress({ transactions, selectedMonth }: DashboardProgressProps) {
  const stats = useMemo(() => {
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const categories = new Set(monthTx.map(t => t.category));
    const lastTx = monthTx.length > 0
      ? monthTx.sort((a, b) => b.date.localeCompare(a.date))[0]
      : null;
    return { total: monthTx.length, categories: categories.size, lastTx };
  }, [transactions, selectedMonth]);

  if (stats.total === 0) return null;

  const phrase = MOTIVATIONAL[stats.total % MOTIVATIONAL.length];

  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-primary" />
        <span className="text-xs font-semibold text-foreground">Seu progresso financeiro</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp size={12} className="text-primary" />
          {stats.total} movimentações neste mês
        </span>
        <span>{stats.categories} categorias utilizadas</span>
      </div>
      <p className="text-[11px] text-muted-foreground/70 italic">{phrase}</p>
    </div>
  );
}
