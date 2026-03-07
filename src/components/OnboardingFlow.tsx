import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Target, BarChart3 } from 'lucide-react';

const ONBOARDING_KEY = 'fincontrol_onboarding_done';

const steps = [
  {
    icon: Wallet,
    title: 'Bem-vindo ao FinControl!',
    description: 'Seu painel financeiro pessoal. Aqui você controla receitas, despesas, investimentos e metas — tudo em um só lugar.',
  },
  {
    icon: ArrowUpRight,
    title: 'Adicione suas receitas',
    description: 'Registre salários, freelances e outras fontes de renda tocando no botão "+" no canto inferior.',
  },
  {
    icon: ArrowDownLeft,
    title: 'Controle suas despesas',
    description: 'Adicione seus gastos por categoria. O sistema identificará padrões e alertará sobre aumentos incomuns.',
  },
  {
    icon: TrendingUp,
    title: 'Registre investimentos',
    description: 'Acompanhe aportes em renda fixa, ações ou cripto. Veja projeções de patrimônio futuro.',
  },
  {
    icon: Target,
    title: 'Defina suas metas',
    description: 'Crie metas financeiras e acompanhe o progresso com contribuições mensais.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios inteligentes',
    description: 'Acesse gráficos comparativos, score financeiro e insights automáticos no Dashboard e Relatórios.',
  },
];

export default function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      setOpen(true);
    }
  }, []);

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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSkip(); }}>
      <DialogContent className="max-w-sm text-center p-8 gap-0">
        <div className="mx-auto mb-5 p-4 rounded-2xl bg-primary/10 w-fit">
          <Icon size={32} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {!isLast && (
            <Button variant="ghost" className="flex-1" onClick={handleSkip}>
              Pular
            </Button>
          )}
          <Button className="flex-1" onClick={handleNext}>
            {isLast ? 'Começar!' : 'Próximo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
