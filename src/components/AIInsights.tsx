import { useState, useEffect, useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/contexts/FinanceContext';
import { useGoals } from '@/contexts/GoalsContext';
import { formatCurrency } from '@/lib/format';
import { getCategoryById } from '@/lib/categories';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface AIInsight {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface AIInsightsProps {
  page?: 'dashboard' | 'financas' | 'investimentos' | 'orcamentos' | 'engenharia';
}

export default function AIInsights({ page = 'dashboard' }: AIInsightsProps) {
  const { transactions, sales, selectedMonth } = useFinance();
  const { goals } = useGoals();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const financialData = useMemo(() => {
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const investment = monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
    const revenue = sales.filter(s => s.date.startsWith(selectedMonth)).reduce((s, v) => s + v.totalValue, 0);

    // Category breakdown
    const catMap = new Map<string, number>();
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const cat = getCategoryById(t.category);
      const name = cat?.name ?? t.category;
      catMap.set(name, (catMap.get(name) ?? 0) + t.amount);
    });
    const topCategories = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, value]) => ({ name, value: formatCurrency(value) }));

    const activeGoals = goals.filter(g => g.status === 'active').map(g => ({
      title: g.title,
      target: formatCurrency(g.targetAmount),
      current: formatCurrency(g.currentAmount),
      pct: Math.round((g.currentAmount / g.targetAmount) * 100),
    }));

    return {
      mes: selectedMonth,
      receitas: formatCurrency(income),
      vendasReceita: formatCurrency(revenue),
      despesas: formatCurrency(expense),
      investimentos: formatCurrency(investment),
      saldoLivre: formatCurrency(income + revenue - expense - investment),
      totalTransacoes: monthTx.length,
      topCategoriasDespesa: topCategories,
      metas: activeGoals,
    };
  }, [transactions, sales, goals, selectedMonth]);

  useEffect(() => {
    // Reset on month/page change
    setFetched(false);
    setInsights([]);
  }, [selectedMonth, page]);

  useEffect(() => {
    if (fetched || loading) return;
    // Only fetch if there's data
    if (transactions.length === 0) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('fincontrol-insights', {
          body: { financialData, page },
        });

        if (!error && data?.insights?.length > 0) {
          setInsights(data.insights);
        }
      } catch {
        // Silently fail - insights are non-critical
      } finally {
        setLoading(false);
        setFetched(true);
      }
    };

    const timer = setTimeout(fetchInsights, 500);
    return () => clearTimeout(timer);
  }, [fetched, loading, financialData, page, transactions.length]);

  if (insights.length === 0 && !loading) return null;

  const iconMap = {
    positive: <TrendingUp size={14} className="text-income" />,
    negative: <TrendingDown size={14} className="text-expense" />,
    neutral: <Lightbulb size={14} className="text-primary" />,
  };

  return (
    <div className="glass rounded-2xl p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-gold" />
        <p className="text-xs font-semibold text-foreground">Insights com IA</p>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
          <p className="text-[11px] text-muted-foreground">Analisando seus dados...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5 animate-fade-in">
              <div className="mt-0.5 shrink-0">{iconMap[insight.type]}</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
