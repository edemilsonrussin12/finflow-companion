import { useMemo } from 'react';
import { Award, AlertTriangle, TrendingUp, PiggyBank, Wallet } from 'lucide-react';

interface FinancialScoreProps {
  income: number;
  expense: number;
  investment: number;
  patrimonio: number;
  prevPatrimonio: number;
}

interface ScoreBreakdown {
  expenseScore: number;
  investmentScore: number;
  savingsScore: number;
  patrimonyScore: number;
  total: number;
}

function calculateScore(income: number, expense: number, investment: number, patrimonio: number, prevPatrimonio: number): ScoreBreakdown {
  if (income <= 0) return { expenseScore: 0, investmentScore: 0, savingsScore: 0, patrimonyScore: 0, total: 0 };

  const expenseRatio = expense / income;
  let expenseScore = 10;
  if (expenseRatio < 0.70) expenseScore = 30;
  else if (expenseRatio <= 0.90) expenseScore = 20;

  const investmentRatio = investment / income;
  let investmentScore = 10;
  if (investmentRatio >= 0.10) investmentScore = 30;
  else if (investmentRatio >= 0.05) investmentScore = 20;

  const monthlySavings = income - expense;
  let savingsScore = 0;
  if (monthlySavings > 0) savingsScore = 20;
  else if (monthlySavings === 0) savingsScore = 10;

  let patrimonyScore = 10;
  if (patrimonio > prevPatrimonio) patrimonyScore = 20;
  else if (patrimonio === prevPatrimonio) patrimonyScore = 10;
  else patrimonyScore = 0;

  const total = Math.max(0, Math.min(100, expenseScore + investmentScore + savingsScore + patrimonyScore));

  return { expenseScore, investmentScore, savingsScore, patrimonyScore, total };
}

function getScoreLabel(score: number): { text: string; colorClass: string } {
  if (score >= 80) return { text: 'Excelente saúde financeira', colorClass: 'text-income' };
  if (score >= 60) return { text: 'Boa saúde financeira', colorClass: 'text-primary' };
  if (score >= 40) return { text: 'Atenção necessária', colorClass: 'text-yellow-400' };
  return { text: 'Situação financeira crítica', colorClass: 'text-expense' };
}

function getInsights(income: number, expense: number, investment: number): string[] {
  const insights: string[] = [];
  if (income <= 0) return insights;

  if (expense / income > 0.80) {
    insights.push('Seus gastos estão altos. Reduzi-los vai melhorar seu score.');
  }
  if (investment / income < 0.05) {
    insights.push('Sua taxa de investimento está baixa. Tente investir ao menos 10% da sua renda.');
  }
  if (income - expense < 0) {
    insights.push('Você está gastando mais do que ganha.');
  }
  return insights;
}

export default function FinancialScore({ income, expense, investment, patrimonio, prevPatrimonio }: FinancialScoreProps) {
  const breakdown = useMemo(() => calculateScore(income, expense, investment, patrimonio, prevPatrimonio), [income, expense, investment, patrimonio, prevPatrimonio]);
  const label = getScoreLabel(breakdown.total);
  const insights = useMemo(() => getInsights(income, expense, investment), [income, expense, investment]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (breakdown.total / 100) * circumference;

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Award size={18} className="text-primary" />
        <span className="text-sm font-medium">Saúde Financeira</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="40" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold tabular-nums">{breakdown.total}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-semibold ${label.colorClass}`}>{label.text}</p>
          <p className="text-xs text-muted-foreground">{breakdown.total} / 100</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Wallet size={12} /> Controle de gastos: <span className="font-semibold text-foreground">{breakdown.expenseScore}/30</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp size={12} /> Investimentos: <span className="font-semibold text-foreground">{breakdown.investmentScore}/30</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <PiggyBank size={12} /> Poupança: <span className="font-semibold text-foreground">{breakdown.savingsScore}/20</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp size={12} /> Patrimônio: <span className="font-semibold text-foreground">{breakdown.patrimonyScore}/20</span>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle size={12} className="text-yellow-400 mt-0.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
