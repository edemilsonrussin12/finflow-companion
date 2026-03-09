import { useMemo, useEffect, useState } from 'react';
import { Award, AlertTriangle, TrendingUp, PiggyBank, Wallet, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/finance';

interface FinancialScoreProps {
  income: number;
  expense: number;
  investment: number;
  patrimonio: number;
  prevPatrimonio: number;
  allTransactions?: Transaction[];
  selectedMonth?: string;
  onOpenInvestmentForm?: () => void;
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
  if (score >= 80) return 'hsl(var(--emerald))';
  if (score >= 60) return 'hsl(var(--score-good))';
  if (score >= 40) return 'hsl(var(--score-attention))';
  return 'hsl(var(--score-critical))';
}

function getScoreGradient(score: number): { from: string; to: string } {
  if (score >= 80) return { from: 'hsl(142, 71%, 45%)', to: 'hsl(142, 71%, 55%)' };
  if (score >= 60) return { from: 'hsl(50, 80%, 50%)', to: 'hsl(50, 80%, 60%)' };
  if (score >= 40) return { from: 'hsl(35, 85%, 55%)', to: 'hsl(35, 85%, 65%)' };
  return { from: 'hsl(0, 72%, 55%)', to: 'hsl(0, 72%, 65%)' };
}

function getScoreLabel(score: number): { text: string; colorClass: string } {
  if (score >= 80) return { text: 'Excelente saúde financeira', colorClass: 'text-emerald' };
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
  actionLabel: string;
  actionType: 'navigate-expenses' | 'open-investment' | 'navigate-investments';
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
      actionLabel: 'Revisar Gastos',
      actionType: 'navigate-expenses',
    });
  }

  if (investment / income < 0.05) {
    recs.push({
      icon: 'warning',
      title: 'Investimentos Baixos',
      message: 'Sua taxa de investimento está baixa. Tente investir ao menos 10% da sua renda para aumentar seu patrimônio.',
      type: 'warning',
      actionLabel: 'Adicionar Investimento',
      actionType: 'open-investment',
    });
  }

  if (income - expense < 0) {
    recs.push({
      icon: 'danger',
      title: 'Saldo Negativo',
      message: 'Você está gastando mais do que ganha. Ajustar seus gastos é essencial.',
      type: 'danger',
      actionLabel: 'Revisar Gastos',
      actionType: 'navigate-expenses',
    });
  }

  if (investment / income >= 0.10) {
    recs.push({
      icon: 'success',
      title: 'Bom Investidor',
      message: 'Ótimo trabalho! Você está investindo uma proporção saudável da sua renda.',
      type: 'success',
      actionLabel: 'Ver Investimentos',
      actionType: 'navigate-investments',
    });
  }

  if (score > 80) {
    recs.push({
      icon: 'trophy',
      title: 'Disciplina Financeira',
      message: 'Excelente disciplina financeira. Continue mantendo seus hábitos para seguir crescendo seu patrimônio.',
      type: 'success',
      actionLabel: 'Ver Investimentos',
      actionType: 'navigate-investments',
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
  success: 'text-emerald bg-emerald/10',
};

function buildEvolutionData(allTransactions: Transaction[], selectedMonth: string) {
  const months: { key: string; label: string }[] = [];
  const [sy, sm] = selectedMonth.split('-').map(Number);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(sy, sm - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    months.push({ key, label });
  }

  return months.map((m, idx) => {
    const monthTx = allTransactions.filter(t => t.date.startsWith(m.key));
    const inc = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const inv = monthTx.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);

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

export default function FinancialScore({ income, expense, investment, patrimonio, prevPatrimonio, allTransactions, selectedMonth, onOpenInvestmentForm }: FinancialScoreProps) {
  const navigate = useNavigate();
  const breakdown = useMemo(() => calculateScore(income, expense, investment, patrimonio, prevPatrimonio), [income, expense, investment, patrimonio, prevPatrimonio]);
  const label = getScoreLabel(breakdown.total);
  const insightMessage = getInsightMessage(breakdown.total);
  const recommendations = useMemo(() => getRecommendations(income, expense, investment, breakdown.total), [income, expense, investment, breakdown.total]);
  const scoreColor = getScoreColor(breakdown.total);
  const scoreGradient = getScoreGradient(breakdown.total);

  const evolutionData = useMemo(() => {
    if (!allTransactions || !selectedMonth) return [];
    return buildEvolutionData(allTransactions, selectedMonth);
  }, [allTransactions, selectedMonth]);

  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
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

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const hasEvolution = evolutionData.some(d => d.score > 0);

  const handleAction = (actionType: Recommendation['actionType']) => {
    switch (actionType) {
      case 'navigate-expenses':
        navigate('/gastos');
        break;
      case 'navigate-investments':
        navigate('/investimentos');
        break;
      case 'open-investment':
        if (onOpenInvestmentForm) {
          onOpenInvestmentForm();
        } else {
          navigate('/investimentos');
        }
        break;
    }
  };

  // Generate unique gradient ID
  const gradientId = `score-gradient-${breakdown.total}`;

  return (
    <div className="space-y-4">
      {/* Premium Gauge Card */}
      <div className="card-premium rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald/10">
            <Award size={18} className="text-emerald" />
          </div>
          <span className="text-sm font-semibold">Saúde Financeira</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Premium Gauge */}
          <div className="relative w-32 h-32 shrink-0">
            {/* Outer glow ring */}
            <div 
              className="absolute inset-0 rounded-full opacity-30 blur-md"
              style={{ background: `radial-gradient(circle, ${scoreColor} 0%, transparent 70%)` }}
            />
            
            <svg className="w-32 h-32 -rotate-90 score-glow" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={scoreGradient.from} />
                  <stop offset="100%" stopColor={scoreGradient.to} />
                </linearGradient>
              </defs>
              
              {/* Background track */}
              <circle 
                cx="50" cy="50" r="42" 
                fill="none" 
                stroke="hsl(var(--muted))" 
                strokeWidth="6" 
                opacity="0.3"
              />
              
              {/* Progress arc with gradient */}
              <circle
                cx="50" cy="50" r="42" 
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ 
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)', 
                  filter: `drop-shadow(0 0 8px ${scoreColor})`
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className="text-3xl font-extrabold tabular-nums" 
                style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}40` }}
              >
                {animatedScore}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>
          
          {/* Score info */}
          <div className="space-y-2">
            <p className={`text-sm font-bold ${label.colorClass}`}>{label.text}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insightMessage}</p>
          </div>
        </div>

        {/* Score breakdown with premium styling */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/30">
            <Wallet size={14} className="text-income" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">Gastos</span>
              <p className="text-xs font-bold text-foreground">{breakdown.expenseScore}/30</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/30">
            <TrendingUp size={14} className="text-emerald" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">Investimentos</span>
              <p className="text-xs font-bold text-foreground">{breakdown.investmentScore}/30</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/30">
            <PiggyBank size={14} className="text-gold" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">Poupança</span>
              <p className="text-xs font-bold text-foreground">{breakdown.savingsScore}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/30">
            <TrendingUp size={14} className="text-cyan" />
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground">Patrimônio</span>
              <p className="text-xs font-bold text-foreground">{breakdown.patrimonyScore}/20</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Insights - Recommendation Cards with Action Buttons */}
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
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className={`p-2 rounded-lg shrink-0 ${bgColor}`}>
                    <Icon size={14} className={textColor} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1 mt-1"
                      onClick={() => handleAction(rec.actionType)}
                    >
                      {rec.actionLabel}
                      <ArrowRight size={12} />
                    </Button>
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
            <TrendingUp size={18} className="text-emerald" />
            <span className="text-sm font-medium">Progresso Financeiro</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(215,12%,55%)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222,40%,8%)', border: '1px solid hsl(222,20%,14%)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(210,20%,85%)' }}
                  formatter={(value: number) => [`${value} pts`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(142,71%,45%)" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: 'hsl(142,71%,45%)', stroke: 'hsl(142,71%,55%)', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: 'hsl(142,71%,55%)', stroke: 'hsl(142,71%,45%)', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
