import { useMemo } from 'react';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { ASSET_TYPE_LABELS, type PortfolioAsset, type PortfolioDividend } from '@/types/portfolio';

const COLORS = ['hsl(153, 60%, 50%)', 'hsl(200, 70%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(45, 90%, 55%)', 'hsl(350, 60%, 55%)', 'hsl(180, 50%, 50%)'];

interface Props {
  assets: PortfolioAsset[];
  dividends: PortfolioDividend[];
}

export default function PortfolioCharts({ assets, dividends }: Props) {
  const distributionData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => {
      const label = ASSET_TYPE_LABELS[a.asset_type] || a.asset_type;
      map[label] = (map[label] || 0) + a.total_invested;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [assets]);

  const monthlyDividends = useMemo(() => {
    const map: Record<string, number> = {};
    dividends.forEach(d => {
      const month = d.received_date.substring(0, 7);
      map[month] = (map[month] || 0) + d.amount;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, value]) => {
      const [y, m] = month.split('-');
      return { month: `${m}/${y.slice(2)}`, value };
    });
  }, [dividends]);

  const evolutionData = useMemo(() => {
    const sorted = [...assets].filter(a => a.purchase_date).sort((a, b) => (a.purchase_date || '').localeCompare(b.purchase_date || ''));
    if (sorted.length === 0) return [];
    const map: Record<string, number> = {};
    let cumulative = 0;
    sorted.forEach(a => {
      const month = a.purchase_date!.substring(0, 7);
      cumulative += a.total_invested;
      map[month] = cumulative;
    });
    // Also add assets without date
    const noDate = assets.filter(a => !a.purchase_date).reduce((s, a) => s + a.total_invested, 0);
    const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length > 0) {
      entries[entries.length - 1][1] += noDate;
    }
    return entries.slice(-12).map(([month, value]) => {
      const [y, m] = month.split('-');
      return { month: `${m}/${y.slice(2)}`, value };
    });
  }, [assets]);

  const tooltipStyle = { background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)', fontSize: '12px' };

  if (assets.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Distribution */}
      {distributionData.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Distribuição da carteira</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {distributionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monthly dividends */}
      {monthlyDividends.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Renda passiva mensal</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDividends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="hsl(153, 60%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Patrimony evolution */}
      {evolutionData.length > 1 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Evolução do patrimônio investido</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="hsl(200, 70%, 55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
