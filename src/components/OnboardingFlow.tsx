import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Target, BarChart3, Award } from 'lucide-react';

const ONBOARDING_KEY = 'fincontrol_onboarding_done';

interface StepDef {
  icon: typeof Wallet;
  title: string;
  description: string;
  input?: 'income' | 'expense' | 'invest';
}

const steps: StepDef[] = [
  {
    icon: Wallet,
    title: 'Bem-vindo ao FinControl!',
    description: 'Seu painel financeiro pessoal. Aqui você controla receitas, despesas, investimentos e metas — tudo em um só lugar.',
  },
  {
    icon: ArrowUpRight,
    title: 'Qual sua renda mensal?',
    description: 'Informe aproximadamente quanto você recebe por mês. Você poderá ajustar depois.',
    input: 'income',
  },
  {
    icon: ArrowDownLeft,
    title: 'Quanto gasta por mês?',
    description: 'Informe seus gastos mensais médios para calcularmos seu score inicial.',
    input: 'expense',
  },
  {
    icon: TrendingUp,
    title: 'Você já investe?',
    description: 'Informe o valor que investe mensalmente. Se ainda não investe, coloque 0.',
    input: 'invest',
  },
  {
    icon: Award,
    title: 'Seu Score Inicial',
    description: '',
  },
];

function calculateSimpleScore(income: number, expense: number, investment: number): number {
  if (income <= 0) return 0;
  const expenseRatio = expense / income;
  let s = 10;
  if (expenseRatio < 0.70) s = 30;
  else if (expenseRatio <= 0.90) s = 20;

  const invRatio = investment / income;
  let inv = 10;
  if (invRatio >= 0.10) inv = 30;
  else if (invRatio >= 0.05) inv = 20;

  const savings = income - expense > 0 ? 20 : income - expense === 0 ? 10 : 0;
  return Math.max(0, Math.min(100, s + inv + savings + 10));
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'hsl(var(--score-excellent))';
  if (score >= 60) return 'hsl(var(--score-good))';
  if (score >= 40) return 'hsl(var(--score-attention))';
  return 'hsl(var(--score-critical))';
}

function getScoreText(score: number): string {
  if (score >= 80) return 'Excelente saúde financeira!';
  if (score >= 60) return 'Boa saúde financeira!';
  if (score >= 40) return 'Atenção necessária';
  return 'Situação financeira crítica';
}

export default function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [invest, setInvest] = useState('');

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setOpen(true);
  }, []);

  const score = useMemo(() => {
    return calculateSimpleScore(
      parseFloat(income) || 0,
      parseFloat(expense) || 0,
      parseFloat(invest) || 0,
    );
  }, [income, expense, invest]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOpen(false);
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  const isScoreStep = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent className="max-w-sm text-center p-8 gap-0">
        <div className="mx-auto mb-5 p-4 rounded-2xl bg-primary/10 w-fit">
          <Icon size={32} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">{current.title}</h2>

        {isScoreStep ? (
          <div className="space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={getScoreColor(score)}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (score / 100) * 2 * Math.PI * 40}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold" style={{ color: getScoreColor(score) }}>{score}</span>
              </div>
            </div>
            <p className="text-sm font-semibold" style={{ color: getScoreColor(score) }}>{getScoreText(score)}</p>
            <p className="text-xs text-muted-foreground">Este é seu score inicial estimado. Ele mudará conforme você registra suas transações reais.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{current.description}</p>
            {current.input && (
              <div className="mb-4">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                  className="text-center text-lg"
                  value={current.input === 'income' ? income : current.input === 'expense' ? expense : invest}
                  onChange={e => {
                    const v = e.target.value;
                    if (current.input === 'income') setIncome(v);
                    else if (current.input === 'expense') setExpense(v);
                    else setInvest(v);
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 my-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/50' : 'bg-muted'}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {!isLast && (
            <Button variant="ghost" className="flex-1" onClick={handleSkip}>
              Pular
            </Button>
          )}
          <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleNext}>
            {isLast ? 'Começar!' : 'Próximo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
