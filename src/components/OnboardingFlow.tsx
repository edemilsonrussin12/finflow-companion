import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Wallet, TrendingUp, ClipboardList, ArrowRight, Sparkles,
  BarChart3, FolderOpen, LineChart, Target, FileText, Users, CheckCircle2
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ONBOARDING_KEY = 'fincontrol_onboarding_done';

type GoalType = 'financas' | 'investimentos' | 'orcamentos';

interface TutorialStep {
  icon: typeof Wallet;
  title: string;
  description: string;
}

const tutorialsByGoal: Record<GoalType, TutorialStep[]> = {
  financas: [
    { icon: Wallet, title: 'Dashboard', description: 'Aqui você vê o resumo da sua vida financeira.' },
    { icon: BarChart3, title: 'Finanças', description: 'Registre seus gastos e receitas de forma simples.' },
    { icon: FolderOpen, title: 'Categorias', description: 'Organize suas movimentações para entender para onde seu dinheiro está indo.' },
    { icon: LineChart, title: 'Gráficos', description: 'Visualize sua evolução financeira.' },
    { icon: CheckCircle2, title: 'Tudo pronto!', description: 'Você já pode começar registrando seu primeiro gasto.' },
  ],
  investimentos: [
    { icon: TrendingUp, title: 'Investimentos', description: 'Cadastre seus investimentos.' },
    { icon: LineChart, title: 'Gráficos', description: 'Visualize a evolução do patrimônio.' },
    { icon: Sparkles, title: 'Engenharia da Riqueza', description: 'Simule o crescimento financeiro ao longo do tempo.' },
    { icon: Target, title: 'Planejamento', description: 'Tenha visão de longo prazo.' },
    { icon: CheckCircle2, title: 'Tudo pronto!', description: 'Comece adicionando seu primeiro investimento.' },
  ],
  orcamentos: [
    { icon: ClipboardList, title: 'Orçamentos', description: 'Crie documentos organizados para enviar ao cliente.' },
    { icon: Users, title: 'Dados do cliente', description: 'Cadastre informações do cliente.' },
    { icon: FileText, title: 'Serviços', description: 'Adicione descrição e valores.' },
    { icon: FileText, title: 'PDF profissional', description: 'Gere documento com seu logo e dados.' },
    { icon: CheckCircle2, title: 'Tudo pronto!', description: 'Crie seu primeiro orçamento.' },
  ],
};

const goalOptions = [
  { value: 'financas' as GoalType, label: 'Organizar minha vida financeira', icon: Wallet },
  { value: 'investimentos' as GoalType, label: 'Acompanhar meus investimentos', icon: TrendingUp },
  { value: 'orcamentos' as GoalType, label: 'Criar orçamentos profissionais', icon: ClipboardList },
];

export default function OnboardingFlow() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'goal' | 'tutorial'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<GoalType | ''>('');
  const [tutorialStep, setTutorialStep] = useState(0);
  const { transactions } = useFinance();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    if (transactions.length > 0) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      return;
    }
    setOpen(true);
  }, [transactions]);

  const saveGoal = async (goal: GoalType) => {
    if (!user) return;
    await supabase.from('profiles').update({ onboarding_goal: goal } as any).eq('id', user.id);
  };

  const handleContinue = () => {
    if (!selectedGoal) return;
    saveGoal(selectedGoal);
    setPhase('tutorial');
    setTutorialStep(0);
  };

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOpen(false);
  };

  const handleStartApp = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOpen(false);
    if (selectedGoal === 'financas') navigate('/financas');
    else if (selectedGoal === 'investimentos') navigate('/investimentos');
    else if (selectedGoal === 'orcamentos') navigate('/orcamentos');
  };

  const handleNextStep = () => {
    const steps = tutorialsByGoal[selectedGoal as GoalType];
    if (tutorialStep < steps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  if (!open) return null;

  // Phase 1: Goal selection
  if (phase === 'goal') {
    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
        <DialogContent className="max-w-sm p-6 gap-0">
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 p-3 rounded-2xl bg-primary/10 w-fit">
              <Sparkles size={24} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Qual seu objetivo principal?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Assim podemos te mostrar o melhor caminho dentro do FinControl.
            </p>
          </div>

          <RadioGroup
            value={selectedGoal}
            onValueChange={(v) => setSelectedGoal(v as GoalType)}
            className="space-y-2"
          >
            {goalOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  selectedGoal === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={opt.value} />
                <div className="p-2 rounded-xl bg-primary/10">
                  <opt.icon size={18} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>

          <div className="flex gap-3 mt-5">
            <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={handleFinish}>
              Pular
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground gap-1.5"
              onClick={handleContinue}
              disabled={!selectedGoal}
            >
              Continuar <ArrowRight size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Phase 2: Tutorial steps
  const steps = tutorialsByGoal[selectedGoal as GoalType];
  const current = steps[tutorialStep];
  const Icon = current.icon;
  const isLast = tutorialStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
      <DialogContent className="max-w-sm text-center p-6 gap-0">
        <div className="mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary to-accent w-fit shadow-lg">
          <Icon size={28} className="text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">{current.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{current.description}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === tutorialStep ? 'bg-primary w-6' : i < tutorialStep ? 'bg-primary/50 w-2' : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 text-muted-foreground" onClick={handleFinish}>
            Pular
          </Button>
          {isLast ? (
            <Button className="flex-1 gradient-primary text-primary-foreground gap-1.5" onClick={handleStartApp}>
              Começar usar o app <ArrowRight size={16} />
            </Button>
          ) : (
            <Button className="flex-1 gradient-primary text-primary-foreground gap-1.5" onClick={handleNextStep}>
              Próximo <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
