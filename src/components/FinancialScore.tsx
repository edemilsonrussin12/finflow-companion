import { useMemo } from 'react';
import { Award } from 'lucide-react';

interface FinancialScoreProps {
  income: number;
  expense: number;
  investment: number;
}

function calculateScore(income: number, expense: number, investment: number): number {
  if (income <= 0) return 0;

  const savingsRate = (income - expense - investment) / income;
  const investmentRate = investment / income;
  const expenseRatio = expense / income;

  let score = 50;

  if (savingsRate > 0.20) score += 20;
  else if (savingsRate > 0.10) score += 10;

  if (investmentRate > 0.10) score += 15;
  else if (investmentRate > 0.05) score += 10;

  if (expenseRatio < 0.60) score += 10;
  else if (expenseRatio < 0.80) score += 5;

  return Math.max(0, Math.min(100, score));
}

function getScoreLabel(score: number): { text: string; colorClass: string } {
  if (score > 80) return { text: 'Excelente controle financeiro', colorClass: 'text-income' };
  if (score >= 60) return { text: 'Boa organização financeira', colorClass: 'text-primary' };
  if (score >= 40) return { text: 'Controle moderado', colorClass: 'text-yellow-400' };
  return { text: 'Atenção aos gastos', colorClass: 'text-expense' };
}

export default function FinancialScore({ income, expense, investment }: FinancialScoreProps) {
  const score = useMemo(() => calculateScore(income, expense, investment), [income, expense, investment]);
  const label = getScoreLabel(score);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} className="text-primary" />
        <span className="text-sm font-medium">Score Financeiro</span>
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
            <span className="text-xl font-extrabold tabular-nums">{score}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-semibold ${label.colorClass}`}>{label.text}</p>
          <p className="text-xs text-muted-foreground">Baseado nas suas receitas, despesas e investimentos deste mês.</p>
        </div>
      </div>
    </div>
  );
}
