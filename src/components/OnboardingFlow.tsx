import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet, Receipt, Target, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'fincontrol_onboarding_done';

interface OnboardingStep {
  icon: typeof Wallet;
  title: string;
  description: string;
  gradient: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Wallet,
    title: 'Bem-vindo ao FinControl',
    description: 'Controle inteligente do seu dinheiro.',
    gradient: 'from-primary to-accent',
  },
  {
    icon: Receipt,
    title: 'Registre seus gastos',
    description: 'Veja para onde seu dinheiro está indo e organize suas finanças.',
    gradient: 'from-primary to-cyan-400',
  },
  {
    icon: Target,
    title: 'Crie metas e acompanhe sua evolução',
    description: 'Acompanhe sua economia e alcance seus objetivos financeiros.',
    gradient: 'from-emerald-500 to-emerald-400',
  },
  {
    icon: Users,
    title: 'Convide amigos e ganhe Premium',
    description: 'Indique amigos e desbloqueie meses de Premium.',
    gradient: 'from-amber-500 to-yellow-400',
  },
];

interface QuickAction {
  icon: typeof Wallet;
  label: string;
  path: string;
}

const quickActions: QuickAction[] = [
  { icon: Receipt, label: 'Adicionar gasto', path: '/gastos' },
  { icon: Target, label: 'Criar meta', path: '/metas' },
  { icon: Sparkles, label: 'Explorar dashboard', path: '/' },
];

export default function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const { transactions } = useFinance();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    if (transactions.length > 0) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      return;
    }
    setOpen(true);
  }, [transactions]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowQuickStart(true);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOpen(false);
  };

  const handleQuickAction = (path: string) => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOpen(false);
    if (path !== '/') navigate(path);
  };

  if (!open) return null;

  if (showQuickStart) {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
        <DialogContent className="max-w-sm text-center p-8 gap-0">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-primary/10 w-fit">
            <Sparkles size={28} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-1">Pronto para começar?</h2>
          <p className="text-sm text-muted-foreground mb-6">Escolha uma ação rápida para dar o primeiro passo.</p>
          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => handleQuickAction(action.path)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
              >
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <action.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-medium flex-1">{action.label}</span>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
          <Button variant="ghost" className="mt-4 text-muted-foreground" onClick={handleFinish}>
            Pular
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
      <DialogContent className="max-w-sm text-center p-8 gap-0">
        <div className={`mx-auto mb-5 p-4 rounded-2xl bg-gradient-to-br ${current.gradient} w-fit shadow-lg`}>
          <Icon size={32} className="text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold mb-2">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{current.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/50 w-2' : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={handleFinish}>
            Pular
          </Button>
          <Button className="flex-1 gradient-primary text-primary-foreground gap-1.5" onClick={handleNext}>
            Próximo <ArrowRight size={16} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
