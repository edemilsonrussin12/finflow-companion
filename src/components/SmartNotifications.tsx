import { useMemo } from 'react';
import { Bell, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { Transaction } from '@/types/finance';

interface Notification {
  icon: typeof Bell;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface SmartNotificationsProps {
  transactions: Transaction[];
  investment: number;
  prevInvestment: number;
}

export default function SmartNotifications({ transactions, investment, prevInvestment }: SmartNotificationsProps) {
  const notifications = useMemo(() => {
    const notes: Notification[] = [];

    // Check if user hasn't added data for 7 days
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length > 0) {
      const lastDate = new Date(sorted[0].date + 'T12:00:00');
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 7) {
        notes.push({
          icon: Clock,
          message: 'Atualize suas finanças para manter seu score de saúde financeira preciso.',
          type: 'warning',
        });
      }
    }

    // Check if course module completed
    const lessonData = localStorage.getItem('engenharia_lessons');
    const progress = lessonData ? JSON.parse(lessonData) : {};
    const completedModules = Object.values(progress).filter((lessons: any) =>
      Array.isArray(lessons) && lessons.length > 0 && lessons.every((l: boolean) => l === true)
    ).length;
    if (completedModules > 0) {
      notes.push({
        icon: BookOpen,
        message: `Ótimo progresso! Você completou ${completedModules} módulo${completedModules > 1 ? 's' : ''} da Engenharia da Riqueza.`,
        type: 'success',
      });
    }

    // Check if investments increased
    if (investment > prevInvestment && prevInvestment > 0) {
      notes.push({
        icon: TrendingUp,
        message: 'Seus investimentos estão crescendo. Continue com o ritmo!',
        type: 'success',
      });
    }

    return notes;
  }, [transactions, investment, prevInvestment]);

  if (notifications.length === 0) return null;

  const colorMap = {
    info: 'bg-primary/10 text-primary',
    success: 'bg-income/10 text-income',
    warning: 'bg-[hsl(var(--score-attention))]/10 text-[hsl(var(--score-attention))]',
  };

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => {
        const Icon = n.icon;
        return (
          <div key={i} className="glass rounded-xl p-3 flex items-start gap-3 animate-fade-in">
            <div className={`p-1.5 rounded-lg shrink-0 ${colorMap[n.type]}`}>
              <Icon size={14} />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
          </div>
        );
      })}
    </div>
  );
}
