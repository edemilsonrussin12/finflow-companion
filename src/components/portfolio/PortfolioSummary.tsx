import { useMemo } from 'react';
import { Briefcase, TrendingUp, Calendar, BarChart3, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { PortfolioAsset, PortfolioDividend } from '@/types/portfolio';

interface Props {
  assets: PortfolioAsset[];
  dividends: PortfolioDividend[];
}

export default function PortfolioSummary({ assets, dividends }: Props) {
  const stats = useMemo(() => {
    const totalInvested = assets.reduce((s, a) => s + a.total_invested, 0);
    const totalDividends = dividends.reduce((s, d) => s + d.amount, 0);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYear = String(now.getFullYear());
    const monthDividends = dividends.filter(d => d.received_date.startsWith(currentMonth)).reduce((s, d) => s + d.amount, 0);
    const yearDividends = dividends.filter(d => d.received_date.startsWith(currentYear)).reduce((s, d) => s + d.amount, 0);
    return { totalInvested, totalDividends, monthDividends, yearDividends, assetCount: assets.length };
  }, [assets, dividends]);

  const cards = [
    { icon: Briefcase, label: 'Total investido', value: formatCurrency(stats.totalInvested), color: 'text-primary' },
    { icon: TrendingUp, label: 'Total proventos', value: formatCurrency(stats.totalDividends), color: 'text-income' },
    { icon: Calendar, label: 'Proventos no mês', value: formatCurrency(stats.monthDividends), color: 'text-income' },
    { icon: BarChart3, label: 'Proventos no ano', value: formatCurrency(stats.yearDividends), color: 'text-income' },
    { icon: Layers, label: 'Ativos cadastrados', value: String(stats.assetCount), color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map(c => (
        <div key={c.label} className="glass rounded-xl p-3 text-center">
          <c.icon size={16} className={`mx-auto mb-1 ${c.color}`} />
          <p className="text-[10px] text-muted-foreground">{c.label}</p>
          <p className={`text-sm font-bold ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
