import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Lock, CheckCircle2, Sparkles, ArrowLeft, FileText, Trophy, Unlock, Crown } from 'lucide-react';
import PdfViewer from '@/components/PdfViewer';
import PremiumPlansDialog from '@/components/PremiumPlansDialog';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface Lesson {
  title: string;
  description: string;
  pdfUrl: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  status: 'free' | 'premium';
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 1,
    title: 'Fundamentos da Mentalidade Financeira',
    description: 'Aprenda os princípios básicos para construir uma mentalidade de abundância e controle financeiro.',
    status: 'free',
    lessons: [
      { title: 'Introdução à Engenharia da Riqueza', description: 'Entenda como o dinheiro realmente funciona e os fundamentos da construção de riqueza.', pdfUrl: '/cursos/modulo1/aula-01-engenharia-da-riqueza.pdf' },
      { title: 'Por que a maioria das pessoas não constrói riqueza', description: 'Descubra os erros financeiros mais comuns que impedem as pessoas de acumular patrimônio.', pdfUrl: '/cursos/modulo1/aula-02-erros-financeiros.pdf' },
      { title: 'Mentalidade de construção de patrimônio', description: 'Aprenda a desenvolver a mentalidade necessária para construir riqueza ao longo do tempo.', pdfUrl: '/cursos/modulo1/aula-03-mentalidade-patrimonio.pdf' },
      { title: 'Princípios fundamentais de organização financeira', description: 'Conheça os pilares da organização financeira e como estruturar seu dinheiro corretamente.', pdfUrl: '/cursos/modulo1/aula-04-organizacao-financeira.pdf' },
      { title: 'Construção de Ativos e Investimentos', description: 'Aprenda como transformar renda em ativos e fazer o dinheiro trabalhar para você.', pdfUrl: '/cursos/modulo1/aula-05-ativos-investimentos.pdf' },
      { title: 'O Método da Engenharia da Riqueza', description: 'Veja o método completo para construir riqueza de forma consistente ao longo da vida.', pdfUrl: '/cursos/modulo1/aula-06-metodo-engenharia-riqueza.pdf' },
    ],
  },
  {
    id: 2,
    title: 'Controle Inteligente do Dinheiro',
    description: 'Domine técnicas avançadas de orçamento e controle de gastos para maximizar seus resultados.',
    status: 'premium',
    lessons: [
      { title: 'Método 50-30-20 Avançado', description: 'Aplique o método de orçamento mais eficiente do mercado.', pdfUrl: '/cursos/modulo2/aula-01-metodo-50-30-20-avancado.pdf' },
      { title: 'Automação Financeira', description: 'Automatize suas finanças para economizar tempo e dinheiro.', pdfUrl: '/cursos/modulo2/aula-02-automacao-financeira.pdf' },
      { title: 'Como eliminar gastos invisíveis', description: 'Encontre e elimine despesas que passam despercebidas.', pdfUrl: '/cursos/modulo2/aula-03-gastos-invisiveis.pdf' },
      { title: 'Criando um sistema de controle financeiro eficiente', description: 'Monte seu sistema pessoal de gestão financeira.', pdfUrl: '/cursos/modulo2/aula-04-sistema-controle-financeiro.pdf' },
    ],
  },
  {
    id: 3,
    title: 'Primeiros Investimentos',
    description: 'Dê os primeiros passos no mundo dos investimentos com segurança e estratégia.',
    status: 'premium',
    lessons: [
      { title: 'Renda fixa vs renda variável', description: 'Entenda as diferenças e quando usar cada tipo.', pdfUrl: '/cursos/modulo3/aula-01-renda-fixa-vs-renda-variavel.pdf' },
      { title: 'Como montar sua reserva de emergência', description: 'Proteja-se contra imprevistos financeiros.', pdfUrl: '/cursos/modulo3/aula-02-reserva-de-emergencia.pdf' },
      { title: 'Tesouro Direto na prática', description: 'Aprenda a investir no Tesouro Direto passo a passo.', pdfUrl: '/cursos/modulo3/aula-03-tesouro-direto.pdf' },
      { title: 'Diversificação para iniciantes', description: 'Como distribuir seus investimentos com inteligência.', pdfUrl: '/cursos/modulo3/aula-04-diversificacao-investimentos.pdf' },
    ],
  },
  {
    id: 4,
    title: 'Construção de Patrimônio',
    description: 'Estratégias para acelerar a construção do seu patrimônio ao longo do tempo.',
    status: 'premium',
    lessons: [
      { title: 'O poder dos juros compostos', description: 'Veja como o tempo multiplica seu dinheiro.', pdfUrl: '/content/modules/modulo4-aula1.pdf' },
      { title: 'Ativos vs passivos', description: 'Aprenda a diferenciar o que gera e o que consome riqueza.', pdfUrl: '/content/modules/modulo4-aula2.pdf' },
      { title: 'Estratégias de acumulação', description: 'Métodos comprovados para acumular patrimônio.', pdfUrl: '/content/modules/modulo4-aula3.pdf' },
      { title: 'Planejamento patrimonial', description: 'Organize e proteja seu patrimônio a longo prazo.', pdfUrl: '/content/modules/modulo4-aula4.pdf' },
    ],
  },
  {
    id: 5,
    title: 'Independência Financeira',
    description: 'O caminho completo para alcançar sua liberdade financeira.',
    status: 'premium',
    lessons: [
      { title: 'Calculando seu número de independência', description: 'Descubra quanto você precisa para viver de renda.', pdfUrl: '/content/modules/modulo5-aula1.pdf' },
      { title: 'Fontes de renda passiva', description: 'Explore diferentes fontes de renda que trabalham por você.', pdfUrl: '/content/modules/modulo5-aula2.pdf' },
      { title: 'Estratégias FIRE', description: 'Conheça o movimento de independência financeira antecipada.', pdfUrl: '/content/modules/modulo5-aula3.pdf' },
      { title: 'Vivendo de renda: o plano definitivo', description: 'Monte seu plano para viver de renda com segurança.', pdfUrl: '/content/modules/modulo5-aula4.pdf' },
    ],
  },
];

type LessonProgress = Record<string, boolean[]>;

function loadLessonProgress(): LessonProgress {
  const saved = localStorage.getItem('engenharia_lessons');
  return saved ? JSON.parse(saved) : {};
}

function saveLessonProgress(progress: LessonProgress) {
  localStorage.setItem('engenharia_lessons', JSON.stringify(progress));
}

function isModuleComplete(progress: LessonProgress, mod: Module): boolean {
  const lessons = progress[mod.id];
  if (!lessons) return false;
  return mod.lessons.every((_, i) => lessons[i] === true);
}

function getModuleLessonPercent(progress: LessonProgress, mod: Module): number {
  const lessons = progress[mod.id];
  if (!lessons) return 0;
  const completed = mod.lessons.filter((_, i) => lessons[i] === true).length;
  return Math.round((completed / mod.lessons.length) * 100);
}

function isModuleAccessible(progress: LessonProgress, mod: Module, allModules: Module[], isPremium: boolean): boolean {
  if (mod.status === 'free') return true;
  if (!isPremium) return false;
  // Premium users still need to complete previous module
  const idx = allModules.findIndex(m => m.id === mod.id);
  if (idx <= 0) return true;
  const prevMod = allModules[idx - 1];
  return isModuleComplete(progress, prevMod);
}

function getModuleLockReason(progress: LessonProgress, mod: Module, allModules: Module[], isPremium: boolean): 'none' | 'premium' | 'previous' {
  if (mod.status === 'free') return 'none';
  if (!isPremium) return 'premium';
  const idx = allModules.findIndex(m => m.id === mod.id);
  if (idx <= 0) return 'none';
  const prevMod = allModules[idx - 1];
  if (!isModuleComplete(progress, prevMod)) return 'previous';
  return 'none';
}

function ModuleDetail({ mod, progress, onToggleLesson, onBack, isPremium, onShowPlans }: {
  mod: Module;
  progress: LessonProgress;
  onToggleLesson: (moduleId: number, lessonIndex: number) => void;
  onBack: () => void;
  isPremium: boolean;
  onShowPlans: () => void;
}) {
  const lessonStates = progress[mod.id] || [];
  const percent = getModuleLessonPercent(progress, mod);
  const allComplete = isModuleComplete(progress, mod);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const isModule1 = mod.id === 1;

  return (
    <>
      {viewingPdf && (
        <PdfViewer
          url={viewingPdf.url}
          title={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}

      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar aos módulos</span>
        </button>

        <div>
          <Badge variant="secondary" className="mb-3">Módulo {mod.id}</Badge>
          <h1 className="text-xl font-bold text-foreground">{mod.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{mod.description}</p>
        </div>

        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso do módulo</span>
            <span className="font-semibold text-foreground">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conteúdo do Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mod.lessons.map((lesson, i) => {
              const completed = lessonStates[i] === true;
              return (
                <div key={i} className={`p-3 rounded-lg transition-colors space-y-2 ${completed ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-xs font-bold ${completed ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                      {completed ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${completed ? 'text-foreground line-through opacity-70' : 'text-foreground'}`}>{lesson.title}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] gap-1"
                      onClick={() => setViewingPdf({ url: lesson.pdfUrl, title: lesson.title })}
                    >
                      <FileText size={12} />
                      Abrir Aula
                    </Button>
                    <Button
                      variant={completed ? 'ghost' : 'default'}
                      size="sm"
                      className="h-7 text-[11px] shrink-0"
                      onClick={() => onToggleLesson(mod.id, i)}
                    >
                      {completed ? 'Concluída ✓' : 'Concluir'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {allComplete && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-6 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground">Módulo Concluído 🎉</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Parabéns! Você concluiu o módulo {mod.title}. Agora você conhece os fundamentos para construir patrimônio e tomar decisões financeiras mais inteligentes.
                </p>
              </div>

              {isModule1 && !isPremium ? (
                <>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Você concluiu o primeiro módulo. Continue sua jornada e desbloqueie todos os módulos do curso.
                  </p>
                  <Button className="w-full gap-2" onClick={onShowPlans}>
                    <Crown className="h-4 w-4" />
                    Ver planos Premium
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <Unlock className="h-4 w-4" />
                    <span>Novo módulo desbloqueado</span>
                  </div>
                  <Button className="w-full" onClick={onBack}>
                    Continuar aprendendo
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default function EngenhariaRiqueza() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>(loadLessonProgress);
  const { isPremium } = usePremiumStatus();

  const handleToggleLesson = useCallback((moduleId: number, lessonIndex: number) => {
    setLessonProgress(prev => {
      const mod = modules.find(m => m.id === moduleId)!;
      const current = prev[moduleId] || new Array(mod.lessons.length).fill(false);
      const updated = [...current];
      updated[lessonIndex] = !updated[lessonIndex];
      const next = { ...prev, [moduleId]: updated };
      saveLessonProgress(next);
      return next;
    });
  }, []);

  const completedModulesCount = useMemo(
    () => modules.filter(m => isModuleComplete(lessonProgress, m)).length,
    [lessonProgress]
  );

  const globalProgress = Math.round((completedModulesCount / modules.length) * 100);

  const handleOpenModule = (mod: Module) => {
    const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
    if (lockReason === 'premium') {
      setShowPremiumDialog(true);
    } else if (lockReason === 'previous') {
      setShowPremiumDialog(false);
      // Could show a different message, but for now just don't open
      return;
    } else {
      setSelectedModule(mod);
    }
  };

  const getModuleIcon = (mod: Module) => {
    if (isModuleComplete(lessonProgress, mod)) return <CheckCircle2 className="h-5 w-5 text-primary" />;
    const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
    if (lockReason !== 'none') return <Lock className="h-5 w-5 text-muted-foreground" />;
    return <BookOpen className="h-5 w-5 text-primary" />;
  };

  const getModuleStatus = (mod: Module) => {
    if (isModuleComplete(lessonProgress, mod)) return 'Concluído';
    const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
    if (lockReason === 'premium') return 'Conteúdo Premium';
    if (lockReason === 'previous') return 'Bloqueado';
    const pct = getModuleLessonPercent(lessonProgress, mod);
    if (pct > 0) return `${pct}%`;
    return 'Disponível';
  };

  if (selectedModule) {
    return (
      <>
        <ModuleDetail
          mod={selectedModule}
          progress={lessonProgress}
          onToggleLesson={handleToggleLesson}
          onBack={() => setSelectedModule(null)}
          isPremium={isPremium}
          onShowPlans={() => setShowPremiumDialog(true)}
        />
        <PremiumPlansDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
      </>
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

      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Sua Jornada</span>
            <span className="text-sm text-muted-foreground">{completedModulesCount}/{modules.length} módulos</span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedModulesCount === modules.length
              ? '🎉 Parabéns! Você completou todos os módulos!'
              : 'Complete as aulas de cada módulo para desbloquear o próximo.'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {modules.map((mod) => {
          const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
          const locked = lockReason !== 'none';
          const percent = getModuleLessonPercent(lessonProgress, mod);
          const isPremiumLocked = lockReason === 'premium';

          return (
            <Card
              key={mod.id}
              className={`cursor-pointer transition-all hover:border-primary/30 ${locked ? 'opacity-60' : ''}`}
              onClick={() => handleOpenModule(mod)}
            >
              <CardContent className="py-4 px-4 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
                    {getModuleIcon(mod)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{mod.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.lessons.length} aulas</p>
                  </div>
                  <Badge
                    variant={isModuleComplete(lessonProgress, mod) ? 'default' : locked ? 'outline' : 'secondary'}
                    className="shrink-0 text-[10px]"
                  >
                    {getModuleStatus(mod)}
                  </Badge>
                </div>
                {!locked && percent > 0 && !isModuleComplete(lessonProgress, mod) && (
                  <Progress value={percent} className="h-1.5" />
                )}
                {isPremiumLocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs gap-1.5 border-primary/30 text-primary"
                    onClick={(e) => { e.stopPropagation(); setShowPremiumDialog(true); }}
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Desbloquear acesso
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PremiumPlansDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
    </div>
  );
}
