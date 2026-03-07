import { useState, useMemo } from 'react';
import { Transaction, TransactionType, RecurrenceFrequency } from '@/types/finance';
import { getMainCategories, getSubCategories, type CategoryDefinition } from '@/lib/categories';
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
  initialType?: TransactionType;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
};

export default function TransactionForm({ onSubmit, onClose, initial, initialType }: Props) {
  const { toast } = useToast();
  const [type, setType] = useState<TransactionType>(initial?.type ?? initialType ?? 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(
    initial?.recurrenceFrequency ?? 'monthly'
  );

  // Category state
  const mainCategories = useMemo(() => getMainCategories(type), [type]);
  const defaultCategory = initial?.category ?? mainCategories[0]?.id ?? '';
  const [category, setCategory] = useState(defaultCategory);
  const [subCategory, setSubCategory] = useState<string>(initial?.subCategory ?? '');

  const subCategories = useMemo(() => getSubCategories(category), [category]);
  const hasSubCategories = subCategories.length > 0;

  // Reset category when type changes (only if not editing)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const cats = getMainCategories(newType);
    if (cats.length > 0) setCategory(cats[0].id);
    setSubCategory('');
  };

  // Reset subcategory when category changes
  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    setSubCategory('');
  };

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

    // Store _general as null
    const finalSubCategory = subCategory && subCategory !== '_general' ? subCategory : null;

    onSubmit({
      type,
      amount: val,
      date,
      category,
      subCategory: finalSubCategory,
      description: description.trim(),
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      recurrencePaused: initial?.recurrencePaused ?? false,
      recurrenceGroupId: initial?.recurrenceGroupId,
    });
    onClose();
  };

  const title = initial ? 'Editar Transação' : `Nova ${TYPE_LABELS[type]}`;

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'income'
                  ? 'gradient-income text-income-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'expense'
                  ? 'gradient-expense text-expense-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('investment')}
              className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                type === 'investment'
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              Investimento
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

          {/* Category */}
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {mainCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory (always shown when parent has subs, with "Geral" option) */}
          {hasSubCategories && (
            <div>
              <Label>Subcategoria</Label>
              <Select value={subCategory || '_general'} onValueChange={v => setSubCategory(v === '_general' ? '' : v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_general">📁 Geral</SelectItem>
                  {subCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
