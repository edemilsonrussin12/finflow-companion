import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, X } from 'lucide-react';
import type { TransactionType } from '@/types/finance';

interface Props {
  onClick: (type: TransactionType) => void;
}

/** Only show FAB on financial pages where adding transactions makes sense */
const FAB_ROUTES: Record<string, { type: TransactionType; label: string; icon: typeof Plus; className: string }[]> = {
  '/': [], // full menu on home
  '/financas': [], // full menu
  '/gastos': [{ type: 'expense', label: 'Adicionar Despesa', icon: ArrowDownLeft, className: 'bg-expense/90 text-white' }],
  '/vendas': [{ type: 'income', label: 'Adicionar Receita', icon: ArrowUpRight, className: 'bg-income/90 text-white' }],
  '/investimentos': [{ type: 'investment', label: 'Adicionar Investimento', icon: TrendingUp, className: 'bg-emerald/90 text-white' }],
};

const ALL_ACTIONS = [
  { type: 'expense' as TransactionType, label: 'Adicionar Despesa', icon: ArrowDownLeft, className: 'bg-expense/90 text-white' },
  { type: 'income' as TransactionType, label: 'Adicionar Receita', icon: ArrowUpRight, className: 'bg-income/90 text-white' },
  { type: 'investment' as TransactionType, label: 'Adicionar Investimento', icon: TrendingUp, className: 'bg-emerald/90 text-white' },
];

export default function FloatingActionButton({ onClick }: Props) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Only show FAB on routes that need it
  const routeActions = FAB_ROUTES[location.pathname];
  if (routeActions === undefined) return null; // Don't show on orcamentos, engenharia, etc.

  const handleClick = () => {
    if (routeActions.length === 1) {
      onClick(routeActions[0].type);
      return;
    }
    setOpen(prev => !prev);
  };

  const handleSelect = (type: TransactionType) => {
    setOpen(false);
    onClick(type);
  };

  const actions = routeActions.length > 0 ? routeActions : ALL_ACTIONS;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex flex-col gap-3 animate-fade-in">
          {actions.map(a => (
            <button
              key={a.type}
              onClick={() => handleSelect(a.type)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-medium text-sm shadow-lg transition-all hover:scale-105 ${a.className}`}
            >
              <a.icon size={18} />
              {a.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={handleClick}
        className="fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full fab-glow flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Adicionar transação"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan opacity-90" />
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-primary via-primary to-cyan" />
        {open ? (
          <X size={26} className="relative text-white drop-shadow-lg" />
        ) : (
          <Plus size={26} className="relative text-white drop-shadow-lg" />
        )}
      </button>
    </>
  );
}
