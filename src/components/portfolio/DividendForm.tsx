import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DIVIDEND_TYPE_LABELS, type DividendType, type PortfolioAsset, type PortfolioDividend } from '@/types/portfolio';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  assets: PortfolioAsset[];
  initial?: PortfolioDividend | null;
}

export default function DividendForm({ open, onClose, onSubmit, assets, initial }: Props) {
  const [assetId, setAssetId] = useState('');
  const [dividendType, setDividendType] = useState<DividendType>('rendimento');
  const [amount, setAmount] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initial) {
      setAssetId(initial.asset_id);
      setDividendType(initial.dividend_type);
      setAmount(String(initial.amount));
      setReceivedDate(initial.received_date);
      setNotes(initial.notes || '');
    } else {
      setAssetId(assets[0]?.id || '');
      setDividendType('rendimento');
      setAmount('');
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initial, open, assets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      asset_id: assetId,
      dividend_type: dividendType,
      amount: parseFloat(amount) || 0,
      received_date: receivedDate,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Rendimento' : 'Adicionar Rendimento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Ativo *</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um ativo" /></SelectTrigger>
              <SelectContent>
                {assets.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.asset_name}{a.ticker ? ` (${a.ticker})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de provento</Label>
            <Select value={dividendType} onValueChange={v => setDividendType(v as DividendType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DIVIDEND_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor recebido (R$) *</Label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label>Data do recebimento *</Label>
            <Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label>Observação</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1" rows={2} placeholder="Opcional" />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={!assetId}>
            {initial ? 'Salvar alterações' : 'Adicionar rendimento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
