import { useMemo } from 'react';
import type { Transaction } from '@/types/finance';
import type { FinancialGoal } from '@/types/goals';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  stat?: string;
  unlocked: boolean;
}

interface UseAchievementsParams {
  transactions: Transaction[];
  goals: FinancialGoal[];
  selectedMonth: string;
}

export function useAchievements({ transactions, goals, selectedMonth }: UseAchievementsParams): Achievement[] {
  return useMemo(() => {
    const achievements: Achievement[] = [];
    const now = new Date();

    // --- Month stats ---
    const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth));
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const saved = income - expense;

    // 1. Saved money this month
    achievements.push({
      id: 'saved-money',
      icon: '💰',
      title: 'Economizou neste mês',
      description: saved > 0
        ? `Você economizou R$ ${saved.toFixed(2).replace('.', ',')} este mês!`
        : 'Continue controlando seus gastos para economizar.',
      stat: saved > 0 ? `R$ ${saved.toFixed(2).replace('.', ',')}` : undefined,
      unlocked: saved > 0,
    });

    // 2. Tracking streak — 7 days
    const uniqueDays = new Set(transactions.map(t => t.date)).size;
    achievements.push({
      id: 'streak-7',
      icon: '🔥',
      title: '7 dias registrando gastos',
      description: uniqueDays >= 7
        ? `Você já registrou gastos em ${uniqueDays} dias diferentes!`
        : `Continue registrando! ${uniqueDays}/7 dias.`,
      stat: uniqueDays >= 7 ? `${uniqueDays} dias` : undefined,
      unlocked: uniqueDays >= 7,
    });

    // 3. Tracking streak — 30 days
    achievements.push({
      id: 'streak-30',
      icon: '🏆',
      title: '30 dias registrando gastos',
      description: uniqueDays >= 30
        ? 'Parabéns! Você criou um hábito financeiro incrível!'
        : `Progresso: ${uniqueDays}/30 dias.`,
      stat: uniqueDays >= 30 ? `${uniqueDays} dias` : undefined,
      unlocked: uniqueDays >= 30,
    });

    // 4. Goal reached
    const completedGoals = goals.filter(g => g.status === 'completed');
    const latestCompleted = completedGoals[0];
    achievements.push({
      id: 'goal-reached',
      icon: '🎯',
      title: 'Meta atingida!',
      description: latestCompleted
        ? `Você atingiu a meta "${latestCompleted.title}"!`
        : 'Crie e alcance sua primeira meta financeira.',
      stat: latestCompleted
        ? `R$ ${Number(latestCompleted.targetAmount).toFixed(2).replace('.', ',')}`
        : undefined,
      unlocked: completedGoals.length > 0,
    });

    // 5. First investment
    const hasInvestment = transactions.some(t => t.type === 'investment');
    achievements.push({
      id: 'first-investment',
      icon: '📈',
      title: 'Primeiro investimento',
      description: hasInvestment
        ? 'Você fez seu primeiro investimento! Continue crescendo.'
        : 'Registre seu primeiro investimento para desbloquear.',
      unlocked: hasInvestment,
    });

    // 6. Savings rate > 20%
    const savingsRate = income > 0 ? ((saved / income) * 100) : 0;
    achievements.push({
      id: 'savings-20',
      icon: '⭐',
      title: 'Taxa de economia > 20%',
      description: savingsRate >= 20
        ? `Sua taxa de economia está em ${savingsRate.toFixed(0)}%! Excelente!`
        : `Sua taxa está em ${savingsRate.toFixed(0)}%. Tente chegar a 20%.`,
      stat: savingsRate >= 20 ? `${savingsRate.toFixed(0)}%` : undefined,
      unlocked: savingsRate >= 20,
    });

    return achievements;
  }, [transactions, goals, selectedMonth]);
}
