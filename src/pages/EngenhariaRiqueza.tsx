import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Lock, CheckCircle2, Sparkles, ArrowLeft, FileText, Trophy,
  Unlock, Crown, Brain, TrendingUp, PiggyBank, Target, Shield, Rocket
} from 'lucide-react';
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
  icon: React.ElementType;
  section: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: 1,
    title: 'Fundamentos da Mentalidade Financeira',
    description: 'Aprenda os princípios para construir uma mentalidade de abundância e controle financeiro.',
    status: 'free',
    icon: Brain,
    section: 'Mentalidade Financeira',
    lessons: [
      { title: 'Introdução à Engenharia da Riqueza', description: 'Entenda como o dinheiro realmente funciona e os fundamentos da construção de riqueza.', pdfUrl: '/cursos/modulo1/aula-01-engenharia-da-riqueza.pdf' },
      { title: 'Por que a maioria não constrói riqueza', description: 'Descubra os erros financeiros mais comuns.', pdfUrl: '/cursos/modulo1/aula-02-erros-financeiros.pdf' },
      { title: 'Mentalidade de construção de patrimônio', description: 'Desenvolva a mentalidade para construir riqueza ao longo do tempo.', pdfUrl: '/cursos/modulo1/aula-03-mentalidade-patrimonio.pdf' },
      { title: 'Princípios de organização financeira', description: 'Conheça os pilares da organização financeira.', pdfUrl: '/cursos/modulo1/aula-04-organizacao-financeira.pdf' },
      { title: 'Construção de Ativos e Investimentos', description: 'Transforme renda em ativos e faça o dinheiro trabalhar para você.', pdfUrl: '/cursos/modulo1/aula-05-ativos-investimentos.pdf' },
      { title: 'O Método da Engenharia da Riqueza', description: 'O método completo para construir riqueza consistentemente.', pdfUrl: '/cursos/modulo1/aula-06-metodo-engenharia-riqueza.pdf' },
    ],
  },
  {
    id: 2,
    title: 'Controle Inteligente do Dinheiro',
    description: 'Domine técnicas avançadas de orçamento e controle de gastos.',
    status: 'premium',
    icon: PiggyBank,
    section: 'Planejamento Financeiro',
    lessons: [
      { title: 'Método 50-30-20 Avançado', description: 'Aplique o método de orçamento mais eficiente do mercado.', pdfUrl: '/cursos/modulo2/aula-01-metodo-50-30-20-avancado.pdf' },
      { title: 'Automação Financeira', description: 'Automatize suas finanças para economizar tempo e dinheiro.', pdfUrl: '/cursos/modulo2/aula-02-automacao-financeira.pdf' },
      { title: 'Como eliminar gastos invisíveis', description: 'Encontre e elimine despesas que passam despercebidas.', pdfUrl: '/cursos/modulo2/aula-03-gastos-invisiveis.pdf' },
      { title: 'Sistema de controle financeiro eficiente', description: 'Monte seu sistema pessoal de gestão financeira.', pdfUrl: '/cursos/modulo2/aula-04-sistema-controle-financeiro.pdf' },
    ],
  },
  {
    id: 3,
    title: 'Primeiros Investimentos',
    description: 'Dê os primeiros passos no mundo dos investimentos com segurança.',
    status: 'premium',
    icon: TrendingUp,
    section: 'Estratégias de Investimento',
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
    description: 'Estratégias para acelerar a construção do seu patrimônio.',
    status: 'premium',
    icon: Shield,
    section: 'Construção de Patrimônio',
    lessons: [
      { title: 'O Poder dos Juros Compostos', description: 'Veja como o tempo multiplica seu dinheiro.', pdfUrl: '/cursos/modulo4/aula-01-juros-compostos.pdf' },
      { title: 'Ativos vs Passivos', description: 'Diferencie o que gera e o que consome riqueza.', pdfUrl: '/cursos/modulo4/aula-02-ativos-vs-passivos.pdf' },
      { title: 'Estratégias de Acumulação', description: 'Métodos comprovados para acumular patrimônio.', pdfUrl: '/cursos/modulo4/aula-03-estrategias-acumulacao.pdf' },
      { title: 'Planejamento Patrimonial', description: 'Organize e proteja seu patrimônio a longo prazo.', pdfUrl: '/cursos/modulo4/aula-04-planejamento-patrimonial.pdf' },
    ],
  },
  {
    id: 5,
    title: 'Independência Financeira',
    description: 'Transforme patrimônio em liberdade financeira com estratégias de renda passiva e planejamento FIRE.',
    status: 'premium',
    icon: Rocket,
    section: 'Evolução e Projeções',
    lessons: [
      { title: 'Calculando seu Número de Independência', description: 'Descubra quanto você precisa acumular para viver de renda.', pdfUrl: '/cursos/modulo5/aula-01-numero-independencia.pdf' },
      { title: 'Fontes de Renda Passiva', description: 'Explore diferentes fontes de renda passiva e como construí-las.', pdfUrl: '/cursos/modulo5/aula-02-renda-passiva.pdf' },
      { title: 'Estratégias FIRE', description: 'Conheça o movimento de independência financeira antecipada.', pdfUrl: '/cursos/modulo5/aula-03-estrategia-fire.pdf' },
      { title: 'Vivendo de Renda', description: 'Monte seu plano definitivo para viver de renda com segurança.', pdfUrl: '/cursos/modulo5/aula-04-viver-de-renda.pdf' },
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
  const idx = allModules.findIndex(m => m.id === mod.id);
  if (idx <= 0) return true;
  return isModuleComplete(progress, allModules[idx - 1]);
}

function getModuleLockReason(progress: LessonProgress, mod: Module, allModules: Module[], isPremium: boolean): 'none' | 'premium' | 'previous' {
  if (mod.status === 'free') return 'none';
  if (!isPremium) return 'premium';
  const idx = allModules.findIndex(m => m.id === mod.id);
  if (idx <= 0) return 'none';
  if (!isModuleComplete(progress, allModules[idx - 1])) return 'previous';
  return 'none';
}

function ModuleDetail({ mod, progress, onToggleLesson, onBack, isPremium, onShowPlans }: {
  mod: Module; progress: LessonProgress;
  onToggleLesson: (moduleId: number, lessonIndex: number) => void;
  onBack: () => void; isPremium: boolean; onShowPlans: () => void;
}) {
  const lessonStates = progress[mod.id] || [];
  const percent = getModuleLessonPercent(progress, mod);
  const allComplete = isModuleComplete(progress, mod);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const ModIcon = mod.icon;

  return (
    <>
      {viewingPdf && <PdfViewer url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /><span className="text-sm">Voltar</span>
        </button>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10"><ModIcon size={20} className="text-primary" /></div>
            <Badge variant="secondary">Módulo {mod.id}</Badge>
          </div>
          <h1 className="text-xl font-bold">{mod.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{mod.section}</p>
        </div>
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Conteúdo</CardTitle></CardHeader>
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
                      <span className={`text-sm font-medium ${completed ? 'line-through opacity-70' : ''}`}>{lesson.title}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    {lesson.pdfUrl ? (
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => setViewingPdf({ url: lesson.pdfUrl, title: lesson.title })}>
                        <FileText size={12} /> Abrir Aula
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Em breve</span>
                    )}
                    <Button variant={completed ? 'ghost' : 'default'} size="sm" className="h-7 text-[11px]" onClick={() => onToggleLesson(mod.id, i)}>
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
              <h2 className="text-lg font-bold">Módulo Concluído 🎉</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Parabéns! Você concluiu {mod.title}.
              </p>
              {mod.id === 1 && !isPremium ? (
                <Button className="w-full gap-2" onClick={onShowPlans}>
                  <Crown className="h-4 w-4" /> Ver planos Premium
                </Button>
              ) : (
                <Button className="w-full" onClick={onBack}>
                  <Unlock className="h-4 w-4 mr-2" /> Continuar aprendendo
                </Button>
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

  const completedModulesCount = useMemo(() => modules.filter(m => isModuleComplete(lessonProgress, m)).length, [lessonProgress]);
  const globalProgress = Math.round((completedModulesCount / modules.length) * 100);
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce((s, m) => {
    const p = lessonProgress[m.id] || [];
    return s + m.lessons.filter((_, i) => p[i] === true).length;
  }, 0);

  const handleOpenModule = (mod: Module) => {
    const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
    if (lockReason === 'premium') { setShowPremiumDialog(true); return; }
    if (lockReason === 'previous') return;
    setSelectedModule(mod);
  };

  // Group modules by section
  const sections = useMemo(() => {
    const map = new Map<string, Module[]>();
    modules.forEach(m => {
      if (!map.has(m.section)) map.set(m.section, []);
      map.get(m.section)!.push(m);
    });
    return Array.from(map.entries());
  }, []);

  if (selectedModule) {
    return (
      <>
        <ModuleDetail
          mod={selectedModule} progress={lessonProgress}
          onToggleLesson={handleToggleLesson} onBack={() => setSelectedModule(null)}
          isPremium={isPremium} onShowPlans={() => setShowPremiumDialog(true)}
        />
        <PremiumPlansDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
      </>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Engenharia da Riqueza
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sua jornada rumo à independência financeira</p>
      </div>

      {/* Global progress */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sua Jornada</span>
            <span className="text-xs text-muted-foreground">{completedLessons}/{totalLessons} aulas • {completedModulesCount}/{modules.length} módulos</span>
          </div>
          <Progress value={globalProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedModulesCount === modules.length
              ? '🎉 Parabéns! Você completou todos os módulos!'
              : 'Complete as aulas de cada módulo para desbloquear o próximo.'}
          </p>
        </CardContent>
      </Card>

      {/* Modules grouped by section */}
      {sections.map(([section, sectionModules]) => (
        <div key={section} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section}</p>
          {sectionModules.map(mod => {
            const lockReason = getModuleLockReason(lessonProgress, mod, modules, isPremium);
            const locked = lockReason !== 'none';
            const percent = getModuleLessonPercent(lessonProgress, mod);
            const complete = isModuleComplete(lessonProgress, mod);
            const ModIcon = mod.icon;

            return (
              <Card
                key={mod.id}
                className={`cursor-pointer transition-all hover:border-primary/30 ${locked ? 'opacity-60' : ''}`}
                onClick={() => handleOpenModule(mod)}
              >
                <CardContent className="py-4 px-4 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary shrink-0">
                      {complete ? <CheckCircle2 className="h-5 w-5 text-primary" /> :
                       locked ? <Lock className="h-5 w-5 text-muted-foreground" /> :
                       <ModIcon className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{mod.title}</span>
                        {lockReason === 'premium' && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                            <Crown className="h-3 w-3 mr-0.5" /> Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                    </div>
                  </div>
                  {!locked && percent > 0 && (
                    <div className="pl-14 flex items-center gap-3">
                      <Progress value={percent} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">{percent}%</span>
                    </div>
                  )}
                  {complete && (
                    <div className="pl-14">
                      <span className="text-[10px] text-primary font-medium">✓ Concluído</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}

      <PremiumPlansDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog} />
    </div>
  );
}
