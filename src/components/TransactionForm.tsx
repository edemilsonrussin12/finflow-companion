import { useState } from 'react';
import { Transaction, TransactionType, Category, CATEGORIES, RecurrenceFrequency } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onSubmit: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  initial?: Transaction;
}

export default function TransactionForm({ onSubmit, onClose, initial }: Props) {
  const { toast } = useToast();
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>(initial?.category ?? 'Outros');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(
    initial?.recurrenceFrequency ?? 'monthly'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe um valor maior que zero' });
      return;
    }
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe uma descrição' });
      return;
    }
    if (!date) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe a data' });
      return;
    }

    onSubmit({
      type,
      amount: val,
      date,
      category,
      description: description.trim(),
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      recurrencePaused: initial?.recurrencePaused ?? false,
      recurrenceGroupId: initial?.recurrenceGroupId,
    });
    onClose();
  };

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? 'Editar' : 'Nova'} Transação</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'income'
                  ? 'gradient-income text-income-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'expense'
                  ? 'gradient-expense text-expense-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Saída
            </button>
          </div>

          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Ex: Supermercado" value={description} onChange={e => setDescription(e.target.value)} required maxLength={100} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1" />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="recurring">Recorrente</Label>
            <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {isRecurring && (
            <div>
              <Label>Frequência</Label>
              <Select value={recurrenceFrequency} onValueChange={v => setRecurrenceFrequency(v as RecurrenceFrequency)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
            {initial ? 'Salvar' : 'Adicionar'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
