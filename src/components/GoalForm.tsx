import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FinancialGoal } from '@/types/goals';

interface Props {
  onSubmit: (g: Omit<FinancialGoal, 'id' | 'currentAmount' | 'createdAt'>) => void;
  onClose: () => void;
  initial?: FinancialGoal;
}

export default function GoalForm({ onSubmit, onClose, initial }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount?.toString() ?? '');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount.replace(',', '.'));
    if (!title.trim()) { toast({ title: 'Título é obrigatório', variant: 'destructive' }); return; }
    if (!amount || amount <= 0) { toast({ title: 'Valor alvo deve ser maior que 0', variant: 'destructive' }); return; }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      targetAmount: amount,
      deadline: deadline || undefined,
      status: initial?.status ?? 'active',
    });
    onClose();
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{initial ? 'Editar Meta' : 'Nova Meta'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input placeholder="Título da meta" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Valor alvo (R$)" type="text" inputMode="decimal" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <Button type="submit" className="w-full">{initial ? 'Salvar' : 'Criar Meta'}</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
