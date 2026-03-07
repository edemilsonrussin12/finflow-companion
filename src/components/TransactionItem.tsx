import { Transaction } from '@/types/finance';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { getCategoryDisplayLabel, getCategoryEmoji } from '@/lib/categories';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Repeat, Pause, Pencil, Trash2 } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onToggleRecurrence?: (t: Transaction) => void;
}

export default function TransactionItem({ transaction, onEdit, onDelete, onToggleRecurrence }: Props) {
  const { type, amount, description, date, category, subCategory, isRecurring, recurrencePaused } = transaction;

  const emoji = getCategoryEmoji(category, subCategory);
  const categoryLabel = getCategoryDisplayLabel(category, subCategory);

  const TypeIcon = type === 'income' ? ArrowUpRight : type === 'investment' ? TrendingUp : ArrowDownLeft;
  const colorClass = type === 'income' ? 'text-income' : type === 'investment' ? 'text-primary' : 'text-expense';
  const bgClass = type === 'income' ? 'bg-income/10' : type === 'investment' ? 'bg-primary/10' : 'bg-expense/10';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors animate-fade-in group">
      <div className={`p-2 rounded-lg ${bgClass}`}>
        <TypeIcon size={18} className={colorClass} />
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
          <span>{emoji} {categoryLabel}</span>
          <span>•</span>
          <span>{formatDateShort(date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold tabular-nums ${colorClass}`}>
          {type === 'expense' ? '-' : '+'}{formatCurrency(amount)}
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
