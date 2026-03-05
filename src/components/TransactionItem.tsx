import { Transaction } from '@/types/finance';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { ArrowDownLeft, ArrowUpRight, Repeat, Pause, Pencil, Trash2 } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleRecurrence?: (t: Transaction) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Moradia': '🏠',
  'Lazer': '🎮',
  'Saúde': '💊',
  'Educação': '📚',
  'Outros': '📦',
};

export default function TransactionItem({ transaction, onEdit, onDelete, onToggleRecurrence }: Props) {
  const { type, amount, description, date, category, isRecurring, recurrencePaused } = transaction;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors animate-fade-in group">
      <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-income/10' : 'bg-expense/10'}`}>
        {type === 'income' ? (
          <ArrowUpRight size={18} className="text-income" />
        ) : (
          <ArrowDownLeft size={18} className="text-expense" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{description}</span>
          {isRecurring && (
            <span className={`shrink-0 ${recurrencePaused ? 'text-muted-foreground' : 'text-primary'}`}>
              {recurrencePaused ? <Pause size={12} /> : <Repeat size={12} />}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{CATEGORY_EMOJI[category]} {category}</span>
          <span>•</span>
          <span>{formatDateShort(date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${type === 'income' ? 'text-income' : 'text-expense'}`}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
        </span>

        <div className="hidden group-hover:flex items-center gap-1">
          {isRecurring && onToggleRecurrence && (
            <button
              onClick={() => onToggleRecurrence(transaction)}
              className="p-1 rounded hover:bg-accent text-muted-foreground"
              title={recurrencePaused ? 'Reativar' : 'Pausar'}
            >
              {recurrencePaused ? <Repeat size={14} /> : <Pause size={14} />}
            </button>
          )}
          <button onClick={() => onEdit(transaction)} className="p-1 rounded hover:bg-accent text-muted-foreground">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(transaction.id)} className="p-1 rounded hover:bg-accent text-expense">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
