import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Sale } from '@/types/finance';
import { X } from 'lucide-react';

interface Props {
  initial?: Sale | null;
  onClose: () => void;
}

export default function SaleForm({ initial, onClose }: Props) {
  const { addSale, updateSale } = useFinance();
  const [product, setProduct] = useState(initial?.product ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [totalValue, setTotalValue] = useState(initial?.totalValue?.toString() ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    const val = parseFloat(totalValue);
    if (!product.trim() || isNaN(qty) || qty <= 0 || isNaN(val) || val <= 0) return;

    const sale = { product: product.trim(), quantity: qty, totalValue: val, date };

    if (initial) {
      updateSale({ ...sale, id: initial.id });
    } else {
      addSale(sale);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 space-y-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? 'Editar venda' : 'Nova venda'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Produto</label>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="Nome do produto"
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Valor total (R$)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={totalValue}
                onChange={e => setTotalValue(e.target.value)}
                placeholder="0,00"
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Data</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          {initial ? 'Salvar' : 'Registrar venda'}
        </button>
      </div>
    </div>
  );
}
