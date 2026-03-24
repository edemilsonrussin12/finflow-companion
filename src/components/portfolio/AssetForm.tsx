import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ASSET_TYPE_LABELS, type AssetType, type PortfolioAsset } from '@/types/portfolio';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: PortfolioAsset | null;
}

export default function AssetForm({ open, onClose, onSubmit, initial }: Props) {
  const [assetType, setAssetType] = useState<AssetType>('acao');
  const [assetName, setAssetName] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setAssetType(initial.asset_type);
      setAssetName(initial.asset_name);
      setTicker(initial.ticker || '');
      setQuantity(String(initial.quantity));
      setAveragePrice(String(initial.average_price));
      setPurchaseDate(initial.purchase_date || '');
      setNotes(initial.notes || '');
    } else {
      setAssetType('acao');
      setAssetName('');
      setTicker('');
      setQuantity('');
      setAveragePrice('');
      setPurchaseDate('');
      setNotes('');
    }
  }, [initial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(averagePrice) || 0;
    onSubmit({
      asset_type: assetType,
      asset_name: assetName.trim(),
      ticker: ticker.trim() || null,
      quantity: qty,
      average_price: price,
      total_invested: Math.round(qty * price * 100) / 100,
      purchase_date: purchaseDate || null,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Ativo' : 'Adicionar Ativo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de investimento</Label>
            <Select value={assetType} onValueChange={v => setAssetType(v as AssetType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome do ativo *</Label>
            <Input value={assetName} onChange={e => setAssetName(e.target.value)} required className="mt-1" placeholder="Ex: PETR4, Bitcoin, CDB Banco X" />
          </div>
          <div>
            <Label>Código / Ticker</Label>
            <Input value={ticker} onChange={e => setTicker(e.target.value)} className="mt-1" placeholder="Opcional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantidade *</Label>
              <Input type="number" min="0" step="0.000001" value={quantity} onChange={e => setQuantity(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>Preço médio (R$) *</Label>
              <Input type="number" min="0" step="0.01" value={averagePrice} onChange={e => setAveragePrice(e.target.value)} required className="mt-1" />
            </div>
          </div>
          <div className="glass rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Valor total investido</p>
            <p className="text-lg font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((parseFloat(quantity) || 0) * (parseFloat(averagePrice) || 0))}
            </p>
          </div>
          <div>
            <Label>Data da compra</Label>
            <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Observação</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" rows={2} placeholder="Opcional" />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
            {initial ? 'Salvar alterações' : 'Adicionar ativo'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
