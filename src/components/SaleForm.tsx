import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Sale } from '@/types/finance';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initial?: Sale | null;
  onClose: () => void;
}

export default function SaleForm({ initial, onClose }: Props) {
  const { addSale, updateSale } = useFinance();
  const { toast } = useToast();
  const [product, setProduct] = useState(initial?.product ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [totalValue, setTotalValue] = useState(initial?.totalValue?.toString() ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    const val = parseFloat(totalValue);
    if (!product.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe o produto' });
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Quantidade deve ser maior que zero' });
      return;
    }
    if (isNaN(val) || val <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Valor deve ser maior que zero' });
      return;
    }

    const sale = { product: product.trim(), quantity: qty, totalValue: val, date };
    if (initial) {
      updateSale({ ...sale, id: initial.id });
    } else {
      addSale(sale);
    }
    onClose();
  };

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? 'Editar venda' : 'Nova venda'}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="product">Produto</Label>
            <Input id="product" value={product} onChange={e => setProduct(e.target.value)} placeholder="Nome do produto" className="mt-1" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qty">Quantidade</Label>
              <Input id="qty" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="total">Valor total (R$)</Label>
              <Input id="total" type="number" min="0.01" step="0.01" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="0,00" className="mt-1" required />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" required />
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
            {initial ? 'Salvar' : 'Registrar venda'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
