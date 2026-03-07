import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Props {
  goalTitle: string;
  onSubmit: (amount: number) => void;
  onClose: () => void;
}

export default function ContributionForm({ goalTitle, onSubmit, onClose }: Props) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0) { toast({ title: 'Valor deve ser maior que 0', variant: 'destructive' }); return; }
    onSubmit(val);
    onClose();
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Contribuir para "{goalTitle}"</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input placeholder="Valor (R$)" type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
          <Button type="submit" className="w-full">Adicionar Contribuição</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
