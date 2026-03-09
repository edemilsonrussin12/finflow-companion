import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, X } from 'lucide-react';
import type { TransactionType } from '@/types/finance';

interface Props {
  onClick: (type: TransactionType) => void;
}

/** Map routes to their primary action, or null for the full menu */
function getRouteActions(pathname: string): { type: TransactionType; label: string; icon: typeof Plus; className: string }[] | null {
  switch (pathname) {
    case '/gastos':
      return [{ type: 'expense', label: 'Adicionar Despesa', icon: ArrowDownLeft, className: 'bg-expense/90 text-white' }];
    case '/vendas':
      return [{ type: 'income', label: 'Adicionar Receita', icon: ArrowUpRight, className: 'bg-income/90 text-white' }];
    case '/investimentos':
      return [{ type: 'investment', label: 'Adicionar Investimento', icon: TrendingUp, className: 'bg-emerald/90 text-white' }];
    default:
      return null; // show full menu
  }
}

const ALL_ACTIONS = [
  { type: 'expense' as TransactionType, label: 'Adicionar Despesa', icon: ArrowDownLeft, className: 'bg-expense/90 text-white' },
  { type: 'income' as TransactionType, label: 'Adicionar Receita', icon: ArrowUpRight, className: 'bg-income/90 text-white' },
  { type: 'investment' as TransactionType, label: 'Adicionar Investimento', icon: TrendingUp, className: 'bg-emerald/90 text-white' },
];

export default function FloatingActionButton({ onClick }: Props) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const routeActions = getRouteActions(location.pathname);

  const handleClick = () => {
    // If the route has a single default action, trigger it directly
    if (routeActions && routeActions.length === 1) {
      onClick(routeActions[0].type);
      return;
    }
    setOpen(prev => !prev);
  };

  const handleSelect = (type: TransactionType) => {
    setOpen(false);
    onClick(type);
  };

  const actions = routeActions ?? ALL_ACTIONS;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Options */}
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

      {/* Premium FAB */}
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
