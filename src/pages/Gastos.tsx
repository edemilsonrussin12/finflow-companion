import { useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction, TransactionType } from '@/types/finance';
import { getMonthLabel } from '@/lib/format';
import { getMainCategories } from '@/lib/categories';
import { ArrowDownLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionItem from '@/components/TransactionItem';
import TransactionForm from '@/components/TransactionForm';

export default function Gastos() {
  const { transactions, updateTransaction, deleteTransaction, selectedMonth, setSelectedMonth, availableMonths } = useFinance();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get categories for the selected type filter
  const filterCategories = useMemo(() => {
    if (filterType === 'all') {
      return [
        ...getMainCategories('income'),
        ...getMainCategories('expense'),
        ...getMainCategories('investment'),
      ];
    }
    return getMainCategories(filterType as TransactionType);
  }, [filterType]);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .filter(t => filterType === 'all' || t.type === filterType)
      .filter(t => filterCategory === 'all' || t.category === filterCategory)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, filterType, filterCategory]);

  const handleToggleRecurrence = (t: Transaction) => {
    updateTransaction({ ...t, recurrencePaused: !t.recurrencePaused });
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-4 animate-fade-in">
      <div>
        <p className="text-sm text-muted-foreground">Gestão</p>
        <h1 className="text-xl font-bold">Gastos</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-2">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(m => (
              <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={v => { setFilterType(v); setFilterCategory('all'); }}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
            <SelectItem value="investment">Investimentos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterCategories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions list */}
      <div className="space-y-2">
      {filtered.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center space-y-3 animate-fade-in">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-expense/10 flex items-center justify-center">
              <ArrowDownLeft size={24} className="text-expense" />
            </div>
            <p className="text-sm font-semibold text-foreground">Nenhuma transação encontrada</p>
            <p className="text-xs text-muted-foreground">Adicione receitas ou despesas com o botão + abaixo.</p>
          </div>
        )}
        {filtered.map(t => (
          <TransactionItem
            key={t.id}
            transaction={t}
            onEdit={setEditingTx}
            onDelete={deleteTransaction}
            onToggleRecurrence={handleToggleRecurrence}
          />
        ))}
      </div>

      {editingTx && (
        <TransactionForm
          initial={editingTx}
          onSubmit={t => updateTransaction({ ...t, id: editingTx.id })}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
