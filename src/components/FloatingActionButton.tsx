import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, X } from 'lucide-react';
import type { TransactionType } from '@/types/finance';

interface Props {
  onClick: (type: TransactionType) => void;
}

export default function FloatingActionButton({ onClick }: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: TransactionType) => {
    setOpen(false);
    onClick(type);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Options */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex flex-col gap-3 animate-fade-in">
          <button
            onClick={() => handleSelect('expense')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-expense/90 text-white font-medium text-sm shadow-lg"
          >
            <ArrowDownLeft size={18} />
            Adicionar Despesa
          </button>
          <button
            onClick={() => handleSelect('income')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-income/90 text-white font-medium text-sm shadow-lg"
          >
            <ArrowUpRight size={18} />
            Adicionar Receita
          </button>
          <button
            onClick={() => handleSelect('investment')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/90 text-primary-foreground font-medium text-sm shadow-lg"
          >
            <TrendingUp size={18} />
            Adicionar Investimento
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center fab-shadow transition-transform hover:scale-105 active:scale-95"
        aria-label="Adicionar transação"
      >
        {open ? <X size={24} className="text-primary-foreground" /> : <Plus size={24} className="text-primary-foreground" />}
      </button>
    </>
  );
}
