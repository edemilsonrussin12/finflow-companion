import { useMemo } from 'react';
import { CheckCircle2, Circle, ArrowDownLeft, TrendingUp, Target, BookOpen } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { FinancialGoal } from '@/types/goals';
import { formatDate } from '@/lib/format';

interface Milestone {
  icon: typeof CheckCircle2;
  title: string;
  message: string;
  date: string;
  completed: boolean;
}

interface FinancialTimelineProps {
  transactions: Transaction[];
  goals: FinancialGoal[];
}

export default function FinancialTimeline({ transactions, goals }: FinancialTimelineProps) {
  const milestones = useMemo(() => {
    const list: Milestone[] = [];

    // First expense
    const firstExpense = [...transactions].filter(t => t.type === 'expense').sort((a, b) => a.date.localeCompare(b.date))[0];
    list.push({
      icon: ArrowDownLeft,
      title: 'Primeira despesa registrada',
      message: firstExpense ? 'Você começou a rastrear seus gastos!' : 'Registre sua primeira despesa para começar.',
      date: firstExpense?.date ?? '',
      completed: !!firstExpense,
    });

    // First investment
    const firstInvestment = [...transactions].filter(t => t.type === 'investment').sort((a, b) => a.date.localeCompare(b.date))[0];
    list.push({
      icon: TrendingUp,
      title: 'Primeiro investimento adicionado',
      message: firstInvestment ? 'Seu patrimônio começou a crescer!' : 'Adicione seu primeiro investimento.',
      date: firstInvestment?.date ?? '',
      completed: !!firstInvestment,
    });

    // First goal
    const firstGoal = [...goals].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    list.push({
      icon: Target,
      title: 'Primeira meta financeira criada',
      message: firstGoal ? 'Você definiu um objetivo para o futuro!' : 'Crie sua primeira meta financeira.',
      date: firstGoal?.createdAt ?? '',
      completed: !!firstGoal,
    });

    // First course module completed
    const lessonData = localStorage.getItem('engenharia_lessons');
    const progress = lessonData ? JSON.parse(lessonData) : {};
    const hasCompletedModule = Object.values(progress).some((lessons: any) =>
      Array.isArray(lessons) && lessons.length > 0 && lessons.every((l: boolean) => l === true)
    );
    list.push({
      icon: BookOpen,
      title: 'Primeiro módulo do curso concluído',
      message: hasCompletedModule ? 'Você completou um módulo da Engenharia da Riqueza!' : 'Complete um módulo do curso.',
      date: '',
      completed: hasCompletedModule,
    });

    return list;
  }, [transactions, goals]);

  const completedCount = milestones.filter(m => m.completed).length;

  if (completedCount === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Sua Evolução Financeira</p>
        <span className="text-xs text-muted-foreground">{completedCount}/{milestones.length}</span>
      </div>
      <div className="space-y-0">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          const isLast = i === milestones.length - 1;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.completed ? 'bg-primary/20' : 'bg-muted'}`}>
                  {m.completed ? (
                    <CheckCircle2 size={14} className="text-primary" />
                  ) : (
                    <Circle size={14} className="text-muted-foreground" />
                  )}
                </div>
                {!isLast && <div className={`w-px flex-1 min-h-[24px] ${m.completed ? 'bg-primary/30' : 'bg-border'}`} />}
              </div>
              <div className={`pb-4 ${!m.completed ? 'opacity-50' : ''}`}>
                <p className="text-xs font-semibold text-foreground">{m.title}</p>
                <p className="text-[11px] text-muted-foreground">{m.message}</p>
                {m.completed && m.date && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(m.date)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
