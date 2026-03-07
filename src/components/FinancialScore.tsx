import { useMemo, useEffect, useState } from 'react';
import { Award, AlertTriangle, TrendingUp, PiggyBank, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types/finance';

interface FinancialScoreProps {
  income: number;
  expense: number;
  investment: number;
  patrimonio: number;
  prevPatrimonio: number;
  allTransactions?: Transaction[];
  selectedMonth?: string;
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

function getScoreColor(score: number): string {
  if (score >= 80) return 'hsl(var(--score-excellent))';
  if (score >= 60) return 'hsl(var(--score-good))';
  if (score >= 40) return 'hsl(var(--score-attention))';
  return 'hsl(var(--score-critical))';
}

function getScoreLabel(score: number): { text: string; colorClass: string } {
  if (score >= 80) return { text: 'Excelente saúde financeira', colorClass: 'text-income' };
  if (score >= 60) return { text: 'Boa saúde financeira', colorClass: 'text-[hsl(var(--score-good))]' };
  if (score >= 40) return { text: 'Atenção necessária', colorClass: 'text-[hsl(var(--score-attention))]' };
  return { text: 'Situação financeira crítica', colorClass: 'text-expense' };
}

function getInsightMessage(score: number): string {
  if (score > 80) return 'Excelente saúde financeira.';
  if (score >= 60) return 'Você está construindo uma boa disciplina financeira.';
  return 'Seus hábitos financeiros precisam de melhoria.';
}

interface Recommendation {
  icon: 'warning' | 'danger' | 'success' | 'trophy';
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'success';
}

function getRecommendations(income: number, expense: number, investment: number, score: number): Recommendation[] {
  const recs: Recommendation[] = [];
  if (income <= 0) return recs;

  if (expense / income > 0.80) {
    recs.push({
      icon: 'warning',
      title: 'Alerta de Gastos',
      message: 'Seus gastos estão consumindo a maior parte da sua renda. Reduzi-los vai melhorar seu score de saúde financeira.',
      type: 'warning',
    });
  }

  if (investment / income < 0.05) {
    recs.push({
      icon: 'warning',
      title: 'Investimentos Baixos',
      message: 'Sua taxa de investimento está baixa. Tente investir ao menos 10% da sua renda para aumentar seu patrimônio.',
      type: 'warning',
    });
  }

  if (income - expense < 0) {
    recs.push({
      icon: 'danger',
      title: 'Saldo Negativo',
      message: 'Você está gastando mais do que ganha. Ajustar seus gastos é essencial.',
      type: 'danger',
    });
  }

  if (investment / income >= 0.10) {
    recs.push({
      icon: 'success',
      title: 'Bom Investidor',
      message: 'Ótimo trabalho! Você está investindo uma proporção saudável da sua renda.',
      type: 'success',
    });
  }

  if (score > 80) {
    recs.push({
      icon: 'trophy',
      title: 'Disciplina Financeira',
      message: 'Excelente disciplina financeira. Continue mantendo seus hábitos para seguir crescendo seu patrimônio.',
      type: 'success',
    });
  }

  return recs;
}

const recIconMap = {
  warning: AlertTriangle,
  danger: AlertTriangle,
  success: TrendingUp,
  trophy: Award,
};

const recColorMap = {
  warning: 'text-[hsl(var(--score-attention))] bg-[hsl(var(--score-attention))]/10',
  danger: 'text-expense bg-expense/10',
  success: 'text-income bg-income/10',
};

/** Calculate scores for last 6 months for the evolution chart */
function buildEvolutionData(allTransactions: Transaction[], selectedMonth: string) {
  const months: { key: string; label: string }[] = [];
  const [sy, sm] = selectedMonth.split('-').map(Number);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(sy, sm - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    months.push({ key, label });
  }

  // Accumulate patrimony up to each month
  const sortedMonths = months.map(m => m.key).sort();

  return months.map((m, idx) => {
    const monthTx = allTransactions.filter(t => t.date.startsWith(m.key));
    const inc = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inv = monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);

    // Simple patrimony: cumulative up to this month vs previous
    const upToThisMonth = allTransactions.filter(t => t.date.slice(0, 7) <= m.key);
    const pat = upToThisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
              - upToThisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const prevKey = idx > 0 ? months[idx - 1].key : (() => {
      const d = new Date(parseInt(m.key.split('-')[0]), parseInt(m.key.split('-')[1]) - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    const upToPrev = allTransactions.filter(t => t.date.slice(0, 7) <= prevKey);
    const prevPat = upToPrev.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                  - upToPrev.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const score = calculateScore(inc, exp, inv, pat, prevPat);
    return { month: m.label, score: inc > 0 ? score.total : 0 };
  });
}

export default function FinancialScore({ income, expense, investment, patrimonio, prevPatrimonio, allTransactions, selectedMonth }: FinancialScoreProps) {
  const breakdown = useMemo(() => calculateScore(income, expense, investment, patrimonio, prevPatrimonio), [income, expense, investment, patrimonio, prevPatrimonio]);
  const label = getScoreLabel(breakdown.total);
  const insightMessage = getInsightMessage(breakdown.total);
  const recommendations = useMemo(() => getRecommendations(income, expense, investment, breakdown.total), [income, expense, investment, breakdown.total]);
  const scoreColor = getScoreColor(breakdown.total);

  const evolutionData = useMemo(() => {
    if (!allTransactions || !selectedMonth) return [];
    return buildEvolutionData(allTransactions, selectedMonth);
  }, [allTransactions, selectedMonth]);

  // Animated score
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 800;
    const from = 0;
    const to = breakdown.total;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [breakdown.total]);

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const hasEvolution = evolutionData.some(d => d.score > 0);

  return (
    <div className="space-y-4">
      {/* Gauge Card */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary" />
          <span className="text-sm font-medium">Saúde Financeira</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke={scoreColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold tabular-nums" style={{ color: scoreColor }}>{animatedScore}</span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className={`text-sm font-semibold ${label.colorClass}`}>{label.text}</p>
            <p className="text-xs text-muted-foreground">{insightMessage}</p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet size={12} /> Gastos: <span className="font-semibold text-foreground">{breakdown.expenseScore}/30</span>
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
      </div>

      {/* Financial Insights - Recommendation Cards */}
      {recommendations.length > 0 && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-primary" />
            <span className="text-sm font-medium">Financial Insights</span>
          </div>
          <div className="space-y-2.5">
            {recommendations.map((rec, i) => {
              const Icon = recIconMap[rec.icon];
              const colors = recColorMap[rec.type];
              const [textColor, bgColor] = colors.split(' ');
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                  <div className={`p-2 rounded-lg shrink-0 ${bgColor}`}>
                    <Icon size={14} className={textColor} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evolution Chart */}
      {hasEvolution && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-sm font-medium">Progresso Financeiro</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(220,18%,12%)', border: '1px solid hsl(220,14%,16%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(210,20%,85%)' }}
                  formatter={(value: number) => [`${value} pts`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(153,60%,50%)" strokeWidth={2.5} dot={{ r: 3, fill: 'hsl(153,60%,50%)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
