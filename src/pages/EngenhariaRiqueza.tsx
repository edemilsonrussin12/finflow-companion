import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen, Lock, CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  description: string;
  status: 'free' | 'premium';
  lessons: string[];
}

const modules: Module[] = [
  {
    id: 1,
    title: 'Fundamentos da Mentalidade Financeira',
    description: 'Aprenda os princípios básicos para construir uma mentalidade de abundância e controle financeiro.',
    status: 'free',
    lessons: [
      'O que é mentalidade financeira',
      'Crenças limitantes sobre dinheiro',
      'Como reprogramar sua relação com finanças',
      'Hábitos de pessoas financeiramente bem-sucedidas',
      'Exercício prático: seu mapa financeiro',
    ],
  },
  {
    id: 2,
    title: 'Controle Inteligente do Dinheiro',
    description: 'Domine técnicas avançadas de orçamento e controle de gastos para maximizar seus resultados.',
    status: 'premium',
    lessons: [
      'Método 50-30-20 avançado',
      'Automação financeira',
      'Como eliminar gastos invisíveis',
      'Criando um sistema de controle eficiente',
    ],
  },
  {
    id: 3,
    title: 'Primeiros Investimentos',
    description: 'Dê os primeiros passos no mundo dos investimentos com segurança e estratégia.',
    status: 'premium',
    lessons: [
      'Renda fixa vs renda variável',
      'Como montar sua reserva de emergência',
      'Tesouro Direto na prática',
      'Diversificação para iniciantes',
    ],
  },
  {
    id: 4,
    title: 'Construção de Patrimônio',
    description: 'Estratégias para acelerar a construção do seu patrimônio ao longo do tempo.',
    status: 'premium',
    lessons: [
      'O poder dos juros compostos',
      'Ativos vs passivos',
      'Estratégias de acumulação',
      'Planejamento patrimonial',
    ],
  },
  {
    id: 5,
    title: 'Independência Financeira',
    description: 'O caminho completo para alcançar sua liberdade financeira.',
    status: 'premium',
    lessons: [
      'Calculando seu número de independência',
      'Fontes de renda passiva',
      'Estratégias FIRE',
      'Vivendo de renda: o plano definitivo',
    ],
  },
];

export default function EngenhariaRiqueza() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('engenharia_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const completedCount = completedModules.length;
  const progressPercent = (completedCount / modules.length) * 100;

  const handleOpenModule = (mod: Module) => {
    if (mod.status === 'premium') {
      setShowPremiumDialog(true);
    } else {
      setSelectedModule(mod);
    }
  };

  const handleCompleteModule = (id: number) => {
    const updated = [...new Set([...completedModules, id])];
    setCompletedModules(updated);
    localStorage.setItem('engenharia_completed', JSON.stringify(updated));
    setSelectedModule(null);
  };

  const getModuleIcon = (mod: Module) => {
    if (completedModules.includes(mod.id)) return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (mod.status === 'premium') return <Lock className="h-5 w-5 text-muted-foreground" />;
    return <BookOpen className="h-5 w-5 text-primary" />;
  };

  const getModuleStatus = (mod: Module) => {
    if (completedModules.includes(mod.id)) return 'Concluído';
    if (mod.status === 'premium') return 'Premium';
    return 'Disponível';
  };

  if (selectedModule) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar aos módulos</span>
        </button>

        <div>
          <Badge variant="secondary" className="mb-3">Módulo {selectedModule.id}</Badge>
          <h1 className="text-xl font-bold text-foreground">{selectedModule.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{selectedModule.description}</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conteúdo do Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedModule.lessons.map((lesson, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{lesson}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          className="w-full"
          onClick={() => handleCompleteModule(selectedModule.id)}
          disabled={completedModules.includes(selectedModule.id)}
        >
          {completedModules.includes(selectedModule.id) ? 'Módulo concluído ✓' : 'Marcar como concluído'}
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Engenharia da Riqueza
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sua jornada rumo à independência financeira</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Seu progresso</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{modules.length} módulos</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Module list */}
      <div className="space-y-3">
        {modules.map((mod) => (
          <Card
            key={mod.id}
            className={`cursor-pointer transition-all hover:border-primary/30 ${
              mod.status === 'premium' && !completedModules.includes(mod.id) ? 'opacity-75' : ''
            }`}
            onClick={() => handleOpenModule(mod)}
          >
            <CardContent className="py-4 px-4 flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
                {getModuleIcon(mod)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{mod.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.lessons.length} aulas</p>
              </div>
              <Badge
                variant={completedModules.includes(mod.id) ? 'default' : mod.status === 'premium' ? 'outline' : 'secondary'}
                className="shrink-0 text-[10px]"
              >
                {getModuleStatus(mod)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Conteúdo Premium
            </DialogTitle>
            <DialogDescription>
              Desbloqueie este módulo para continuar sua jornada financeira.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Acesse todos os módulos e acelere sua evolução financeira com conteúdo exclusivo.
            </p>
            <Button className="w-full" onClick={() => setShowPremiumDialog(false)}>
              Desbloquear conteúdo premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
