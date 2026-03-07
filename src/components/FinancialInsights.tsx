import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import { Lightbulb, TrendingUp, TrendingDown, PiggyBank, Target, ShoppingBag } from 'lucide-react';

interface Insight {
  icon: React.ReactNode;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export default function FinancialInsights() {
  const { transactions, sales, selectedMonth } = useFinance();
  const { goals } = useGoals();

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const revenue = sales.filter(s => s.date.startsWith(selectedMonth)).reduce((s, v) => s + v.totalValue, 0);
    const totalIncome = income + revenue;

    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevTx = transactions.filter(t => t.date.startsWith(prevMonth));
    const prevIncome = prevTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevRevenue = sales.filter(s => s.date.startsWith(prevMonth)).reduce((s, v) => s + v.totalValue, 0);
    const prevTotalIncome = prevIncome + prevRevenue;

    const hasCurrent = monthTx.length > 0 || revenue > 0;
    const hasPrev = prevTx.length > 0 || prevRevenue > 0;

    if (totalIncome > 0) {
      const saved = totalIncome - expense;
      const savingsRate = (saved / totalIncome) * 100;
      if (savingsRate > 0) {
        result.push({
          icon: <PiggyBank size={16} className="text-income" />,
          text: `Você economizou ${savingsRate.toFixed(0)}% da sua renda este mês (${formatCurrency(saved)}).`,
          type: 'positive',
        });
      } else {
        result.push({
          icon: <PiggyBank size={16} className="text-expense" />,
          text: `Suas despesas superaram sua renda em ${formatCurrency(Math.abs(saved))} este mês.`,
          type: 'negative',
        });
      }
    }

    if (hasCurrent && hasPrev && prevExpense > 0) {
      const diff = expense - prevExpense;
      const pct = ((diff / prevExpense) * 100).toFixed(0);
      if (diff > 0) {
        result.push({
          icon: <TrendingUp size={16} className="text-expense" />,
          text: `Despesas aumentaram ${pct}% em relação ao mês anterior (+${formatCurrency(diff)}).`,
          type: 'negative',
        });
      } else if (diff < 0) {
        result.push({
          icon: <TrendingDown size={16} className="text-income" />,
          text: `Despesas reduziram ${Math.abs(Number(pct))}% em relação ao mês anterior (${formatCurrency(diff)}).`,
          type: 'positive',
        });
      }
    }

    if (hasCurrent && hasPrev && prevTotalIncome > 0) {
      const diff = totalIncome - prevTotalIncome;
      const pct = ((diff / prevTotalIncome) * 100).toFixed(0);
      if (diff > 0) {
        result.push({
          icon: <TrendingUp size={16} className="text-income" />,
          text: `Receitas cresceram ${pct}% comparado ao mês anterior (+${formatCurrency(diff)}).`,
          type: 'positive',
        });
      } else if (diff < 0) {
        result.push({
          icon: <TrendingDown size={16} className="text-expense" />,
          text: `Receitas caíram ${Math.abs(Number(pct))}% comparado ao mês anterior (${formatCurrency(diff)}).`,
          type: 'negative',
        });
      }
    }

    // Top expense category - using parent category names
    if (expense > 0) {
      const catMap = new Map<string, number>();
      monthTx.filter(t => t.type === 'expense').forEach(t => {
        const cat = getCategoryById(t.category);
        const displayName = cat?.name ?? t.category;
        catMap.set(displayName, (catMap.get(displayName) ?? 0) + t.amount);
      });
      const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const [topCat, topVal] = sorted[0];
        const pct = ((topVal / expense) * 100).toFixed(0);
        result.push({
          icon: <ShoppingBag size={16} className="text-primary" />,
          text: `${topCat} representou ${pct}% das despesas este mês (${formatCurrency(topVal)}).`,
          type: 'neutral',
        });
      }
    }

    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      const closest = activeGoals.reduce((best, g) => {
        const pct = g.currentAmount / g.targetAmount;
        const bestPct = best.currentAmount / best.targetAmount;
        return pct > bestPct ? g : best;
      });
      const pct = Math.min(100, Math.round((closest.currentAmount / closest.targetAmount) * 100));
      const remaining = closest.targetAmount - closest.currentAmount;
      if (pct >= 100) {
        result.push({
          icon: <Target size={16} className="text-income" />,
          text: `Meta "${closest.title}" concluída! 🎉`,
          type: 'positive',
        });
      } else {
        result.push({
          icon: <Target size={16} className="text-primary" />,
          text: `Meta "${closest.title}" está em ${pct}% — faltam ${formatCurrency(remaining)}.`,
          type: 'neutral',
        });
      }
    }

    return result.slice(0, 3);
  }, [transactions, sales, selectedMonth, goals]);

  if (insights.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb size={18} className="text-primary" />
        <p className="text-sm font-medium">Insights financeiros</p>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">{insight.icon}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
