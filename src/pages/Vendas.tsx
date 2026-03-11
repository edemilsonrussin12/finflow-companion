import { useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency, formatDateShort, getMonthLabel } from '@/lib/format';
import { Sale } from '@/types/finance';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SaleForm from '@/components/SaleForm';

export default function Vendas() {
  const { sales, deleteSale, updateSale, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const monthSales = useMemo(
    () => sales.filter(s => s.date.startsWith(selectedMonth)),
    [sales, selectedMonth]
  );

  const revenue = useMemo(
    () => monthSales.reduce((sum, s) => sum + s.totalValue, 0),
    [monthSales]
  );

  const totalQty = useMemo(
    () => monthSales.reduce((sum, s) => sum + s.quantity, 0),
    [monthSales]
  );

  const sorted = useMemo(
    () => [...monthSales].sort((a, b) => b.date.localeCompare(a.date)),
    [monthSales]
  );

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Vendas</p>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="text-xl font-bold border-none p-0 h-auto shadow-none focus:ring-0 w-auto gap-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={() => { setEditingSale(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
        >
          <Plus size={16} /> Nova venda
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Faturamento</p>
          <p className="text-lg font-bold text-income tabular-nums">{formatCurrency(revenue)}</p>
        </div>
        <div className="glass rounded-2xl p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Itens vendidos</p>
          <p className="text-lg font-bold tabular-nums">{totalQty}</p>
        </div>
      </div>

      {/* List */}
      <div>
        <p className="text-sm font-medium mb-3">Vendas do mês</p>
        <div className="space-y-2">
          {sorted.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center space-y-3 animate-fade-in">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package size={24} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Nenhuma venda registrada</p>
              <p className="text-xs text-muted-foreground">Registre sua primeira venda para acompanhar seu faturamento.</p>
              <button
                onClick={() => { setEditingSale(null); setShowForm(true); }}
                className="text-primary text-sm font-medium hover:underline"
              >
                Registrar primeira venda
              </button>
            </div>
          )}
          {sorted.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors group">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.product}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{s.quantity} un.</span>
                  <span>•</span>
                  <span>{formatDateShort(s.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-income tabular-nums">{formatCurrency(s.totalValue)}</span>
                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingSale(s); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-accent active:bg-accent text-muted-foreground">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteSale(s.id)} className="p-1.5 rounded-lg hover:bg-accent active:bg-accent text-expense">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <SaleForm
          initial={editingSale}
          onClose={() => { setShowForm(false); setEditingSale(null); }}
        />
      )}
    </div>
  );
}
