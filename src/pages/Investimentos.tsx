import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { formatCurrency, getMonthLabel } from '@/lib/format';
import { calculateInvestment } from '@/lib/investment';
import { exportPortfolioPDF, exportPortfolioExcel } from '@/lib/portfolioExport';
import { ASSET_TYPE_LABELS, DIVIDEND_TYPE_LABELS, type PortfolioAsset, type PortfolioDividend, type AssetType } from '@/types/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, Banknote, Percent, Briefcase, Plus, Pencil, Trash2, Download, FileText, FileSpreadsheet, Coins } from 'lucide-react';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';
import WealthProjection from '@/components/WealthProjection';
import WealthSimulator from '@/components/WealthSimulator';
import PremiumGate from '@/components/PremiumGate';
import AssetForm from '@/components/portfolio/AssetForm';
import DividendForm from '@/components/portfolio/DividendForm';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import PortfolioCharts from '@/components/portfolio/PortfolioCharts';
import ConfirmDialog from '@/components/ConfirmDialog';
import AIInsights from '@/components/AIInsights';
import AskAssistantButton from '@/components/AskAssistantButton';
import type { Transaction } from '@/types/finance';

export default function Investimentos() {
  const { transactions, sales, addTransaction, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const { assets, dividends, loading: portfolioLoading, addAsset, updateAsset, deleteAsset, addDividend, updateDividend, deleteDividend } = usePortfolio();
  const outletCtx = useOutletContext<{ openAssistant?: () => void }>();
  const { isPremium } = usePremiumStatus();

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [assetFormOpen, setAssetFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [dividendFormOpen, setDividendFormOpen] = useState(false);
  const [editingDividend, setEditingDividend] = useState<PortfolioDividend | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'asset' | 'dividend'; id: string } | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Calculator state
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
    () => transactions.filter(t => t.type === 'investment' && t.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, selectedMonth]
  );

  const totalInvested = useMemo(() => monthInvestments.reduce((s, t) => s + t.amount, 0), [monthInvestments]);

  const currentPatrimony = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const allSalesRevenue = sales.reduce((s, v) => s + v.totalValue, 0);
    return allIncome + allSalesRevenue - allExpense;
  }, [transactions, sales]);

  // Filtered & sorted assets
  const filteredAssets = useMemo(() => {
    let list = [...assets];
    if (filterType !== 'all') list = list.filter(a => a.asset_type === filterType);
    switch (sortBy) {
      case 'value_desc': list.sort((a, b) => b.total_invested - a.total_invested); break;
      case 'name': list.sort((a, b) => a.asset_name.localeCompare(b.asset_name)); break;
      default: list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return list;
  }, [assets, filterType, sortBy]);

  // Filtered dividends (by asset filter type)
  const filteredDividends = useMemo(() => {
    let list = [...dividends];
    if (filterType !== 'all') {
      const assetIds = new Set(assets.filter(a => a.asset_type === filterType).map(a => a.id));
      list = list.filter(d => assetIds.has(d.asset_id));
    }
    return list;
  }, [dividends, filterType, assets]);

  const handleCalculate = (e: React.FormEvent) => { e.preventDefault(); setCalculated(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'asset') await deleteAsset(deleteConfirm.id);
    else await deleteDividend(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const assetMap = useMemo(() => new Map(assets.map(a => [a.id, a])), [assets]);

  return (
    <div className="page-container pt-6 pb-24 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">FinControl</p>
          <h1 className="text-xl font-bold">Investimentos</h1>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-auto gap-2 border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            {availableMonths.map(m => (<SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="carteira" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="carteira">Carteira</TabsTrigger>
          <TabsTrigger value="proventos">Proventos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* ==================== CARTEIRA TAB ==================== */}
        <TabsContent value="carteira" className="space-y-6 mt-4">
          <PortfolioSummary assets={assets} dividends={dividends} />

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recente</SelectItem>
                <SelectItem value="value_desc">Maior valor</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minha Carteira */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                <p className="text-sm font-medium">Minha Carteira</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingAsset(null); setAssetFormOpen(true); }} className="text-primary border-primary/30 hover:bg-primary/10">
                <Plus size={14} className="mr-1" /> Adicionar ativo
              </Button>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Adicione seu primeiro ativo para começar a montar sua carteira.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map(a => (
                  <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{ASSET_TYPE_LABELS[a.asset_type]}</span>
                        <p className="text-sm font-medium truncate">{a.asset_name}</p>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        {a.ticker && <span>{a.ticker}</span>}
                        <span>Qtd: {a.quantity}</span>
                        <span>PM: {formatCurrency(a.average_price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <p className="text-sm font-bold text-primary whitespace-nowrap">{formatCurrency(a.total_invested)}</p>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingAsset(a); setAssetFormOpen(true); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm({ type: 'asset', id: a.id })}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legacy transaction investments */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <p className="text-sm font-medium">Aportes do mês</p>
              </div>
              <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(totalInvested)}</p>
            </div>
            {monthInvestments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Nenhum aporte em {getMonthLabel(selectedMonth)}</p>
                <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="mt-2 text-primary border-primary/30 hover:bg-primary/10">
                  <Plus size={14} className="mr-1" /> Adicionar Investimento
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {monthInvestments.map(t => (<TransactionItem key={t.id} transaction={t} onEdit={setEditingTx} onDelete={deleteTransaction} />))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ==================== PROVENTOS TAB ==================== */}
        <TabsContent value="proventos" className="space-y-6 mt-4">
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-income" />
                <p className="text-sm font-medium">Proventos Recebidos</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditingDividend(null); setDividendFormOpen(true); }}
                className="text-income border-income/30 hover:bg-income/10" disabled={assets.length === 0}>
                <Plus size={14} className="mr-1" /> Adicionar rendimento
              </Button>
            </div>

            {assets.length === 0 ? (
              <div className="text-center py-8">
                <Coins size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Cadastre um ativo primeiro para registrar proventos.</p>
              </div>
            ) : filteredDividends.length === 0 ? (
              <div className="text-center py-8">
                <Coins size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Registre seu primeiro rendimento para acompanhar sua renda passiva.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDividends.map(d => {
                  const asset = assetMap.get(d.asset_id);
                  return (
                    <div key={d.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{asset?.asset_name || 'Ativo removido'}</p>
                        <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{DIVIDEND_TYPE_LABELS[d.dividend_type]}</span>
                          <span>{new Date(d.received_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <p className="text-sm font-bold text-income whitespace-nowrap">{formatCurrency(d.amount)}</p>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingDividend(d); setDividendFormOpen(true); }}>
                          <Pencil size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm({ type: 'dividend', id: d.id })}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ==================== RELATÓRIOS TAB ==================== */}
        <TabsContent value="relatorios" className="space-y-6 mt-4">
          <PortfolioCharts assets={assets} dividends={dividends} />

          {/* Export buttons */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-sm font-medium mb-2">Exportar dados</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => exportPortfolioPDF(assets, dividends)} disabled={assets.length === 0} className="gap-2">
                <FileText size={16} /> Exportar PDF
              </Button>
              <Button variant="outline" onClick={() => exportPortfolioExcel(assets, dividends)} disabled={assets.length === 0} className="gap-2">
                <FileSpreadsheet size={16} /> Exportar Excel
              </Button>
            </div>
          </div>

          {/* Premium simulator/calculator/projection */}
          <PremiumGate isPremium={isPremium} label="Simulador de patrimônio, calculadora e projeção financeira são recursos Premium.">
            <WealthSimulator currentPatrimony={currentPatrimony + assets.reduce((s, a) => s + a.total_invested, 0)} />

            <form onSubmit={handleCalculate} className="glass rounded-2xl p-5 space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={18} className="text-primary" />
                <span className="text-sm font-medium">Calculadora</span>
              </div>
              <div>
                <Label htmlFor="initial">Aporte inicial (R$)</Label>
                <Input id="initial" type="number" min="0" step="0.01" value={initialAmount} onChange={e => { setInitialAmount(e.target.value); setCalculated(false); }} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="monthly">Aporte mensal (R$)</Label>
                <Input id="monthly" type="number" min="0" step="0.01" value={monthlyContribution} onChange={e => { setMonthlyContribution(e.target.value); setCalculated(false); }} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="rate">Taxa de juros (% ao mês)</Label>
                <Input id="rate" type="number" min="0" step="0.01" value={monthlyRate} onChange={e => { setMonthlyRate(e.target.value); setCalculated(false); }} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="months">Período (meses)</Label>
                <Input id="months" type="number" min="1" step="1" value={months} onChange={e => { setMonths(e.target.value); setCalculated(false); }} className="mt-1" />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">Calcular</Button>
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
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 55%)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'value' ? 'Valor total' : 'Investido']}
                          contentStyle={{ background: 'hsl(220, 18%, 12%)', border: 'none', borderRadius: '8px', color: 'hsl(210, 20%, 95%)', fontSize: '12px' }}
                          labelFormatter={l => `Mês ${l}`} />
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
        </TabsContent>
      </Tabs>

      {/* Forms & Dialogs */}
      <AssetForm open={assetFormOpen} onClose={() => { setAssetFormOpen(false); setEditingAsset(null); }}
        onSubmit={data => editingAsset ? updateAsset(editingAsset.id, data) : addAsset(data)} initial={editingAsset} />

      <DividendForm open={dividendFormOpen} onClose={() => { setDividendFormOpen(false); setEditingDividend(null); }}
        onSubmit={data => editingDividend ? updateDividend(editingDividend.id, data) : addDividend(data)}
        assets={assets} initial={editingDividend} />

      <ConfirmDialog open={!!deleteConfirm} title="Confirmar exclusão"
        description={deleteConfirm?.type === 'asset' ? 'Excluir este ativo e todos os proventos associados?' : 'Excluir este rendimento?'}
        onConfirm={handleDeleteConfirm} onOpenChange={(v) => { if (!v) setDeleteConfirm(null); }} />

      {editingTx && (
        <TransactionForm initial={editingTx} onSubmit={t => updateTransaction({ ...t, id: editingTx.id, type: 'investment' })} onClose={() => setEditingTx(null)} />
      )}
      {showForm && (
        <TransactionForm initialType="investment" onSubmit={t => addTransaction({ ...t, type: 'investment' })} onClose={() => setShowForm(false)} />
      )}

      <AIInsights page="investimentos" />
      <div className="px-4 pb-24">
        <AskAssistantButton onClick={() => outletCtx?.openAssistant?.()} />
      </div>
    </div>
  );
}
